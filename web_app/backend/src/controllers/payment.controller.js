const pool = require('../config/db');
const midtrans = require('../config/midtrans');

const VALID_TYPES = ['down_payment', 'settlement'];

// Berapa lama VA berlaku. Dikirim ke Midtrans sebagai custom_expiry SEKALIGUS
// disimpan di kolom expires_at, supaya angka yang dilihat user di halaman VA
// sama persis dengan yang dipegang gateway.
const VA_EXPIRY_HOURS = 24;

// Sisi sukses dari sebuah pembayaran: tandai payment lunas, majukan status
// booking, dan kunci slotnya. Dipakai bersama oleh webhook Midtrans dan
// endpoint simulasi supaya dua jalur itu tidak pernah berbeda perilaku.
//
// Idempoten: kalau baris payment sudah 'success', tidak ada yang berubah.
// Midtrans mengirim notifikasi yang sama berkali-kali, jadi ini wajib.
async function applySuccess(client, paymentId, gatewayTxnId) {
  const upd = await client.query(
    `UPDATE payments
        SET gateway_status = 'success',
            paid_at = COALESCE(paid_at, now()),
            gateway_transaction_id = COALESCE(gateway_transaction_id, $2)
      WHERE payment_id = $1 AND gateway_status <> 'success'
      RETURNING booking_id, payment_type`,
    [paymentId, gatewayTxnId || null]
  );

  if (upd.rows.length === 0) return { changed: false };

  const { booking_id, payment_type } = upd.rows[0];

  if (payment_type === 'down_payment') {
    await client.query(
      `UPDATE bookings SET payment_status = 'dp_paid', updated_at = now()
        WHERE booking_id = $1 AND payment_status = 'pending'`,
      [booking_id]
    );
    // DP masuk = slot resmi terpakai, bukan sekadar 'held'.
    await client.query(
      `UPDATE vendor_schedules SET status = 'booked', updated_at = now()
        WHERE schedule_id = (SELECT schedule_id FROM bookings WHERE booking_id = $1)
          AND status <> 'booked'`,
      [booking_id]
    );
  } else {
    await client.query(
      `UPDATE bookings SET payment_status = 'fully_paid', updated_at = now()
        WHERE booking_id = $1 AND payment_status = 'dp_paid'`,
      [booking_id]
    );
  }

  return { changed: true, booking_id, payment_type };
}

// POST /api/v1/payments/charge  (login)
// Body: { booking_id, payment_type: 'down_payment'|'settlement', bank }
async function charge(req, res, next) {
  const { booking_id, payment_type, bank } = req.body;

  if (!booking_id || !payment_type || !bank) {
    return res.status(400).json({ message: 'booking_id, payment_type, dan bank wajib diisi' });
  }
  if (!VALID_TYPES.includes(payment_type)) {
    return res.status(400).json({ message: 'payment_type tidak valid', allowed: VALID_TYPES });
  }
  if (!midtrans.SUPPORTED_BANKS.includes(bank)) {
    return res.status(400).json({ message: 'bank tidak didukung', allowed: midtrans.SUPPORTED_BANKS });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Kepemilikan ikut di WHERE, bukan if terpisah — booking milik orang lain
    // tidak ditemukan sama sekali, jadi balasannya 404 dan ID valid tidak bocor.
    // FOR UPDATE mencegah dua klik "Bayar" bersamaan bikin dua VA.
    const bk = await client.query(
      `SELECT booking_id, total_price, dp_amount, payment_status
         FROM bookings
        WHERE booking_id = $1 AND user_id = $2
        FOR UPDATE`,
      [booking_id, req.user.user_id]
    );

    if (bk.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    const booking = bk.rows[0];

    // Jumlah SELALU dihitung ulang dari DB. Angka dari browser tidak dipercaya.
    let amount;
    if (payment_type === 'down_payment') {
      if (booking.payment_status !== 'pending') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          message: `DP tidak bisa dibayar, status booking saat ini '${booking.payment_status}'`,
        });
      }
      amount = Math.round(Number(booking.dp_amount));
    } else {
      if (booking.payment_status !== 'dp_paid') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          message: `Pelunasan butuh DP lunas dulu, status booking saat ini '${booking.payment_status}'`,
        });
      }
      amount = Math.round(Number(booking.total_price) - Number(booking.dp_amount));
    }

    // Kalau sudah ada VA aktif untuk jenis yang sama, kembalikan yang itu.
    // Bikin VA baru tiap kali user refresh cuma bikin sampah di Midtrans dan
    // bikin user bingung harus transfer ke nomor yang mana.
    const existing = await client.query(
      `SELECT * FROM payments
        WHERE booking_id = $1 AND payment_type = $2
          AND gateway_status = 'pending'
          AND (expires_at IS NULL OR expires_at > now())
        ORDER BY created_at DESC LIMIT 1`,
      [booking_id, payment_type]
    );

    if (existing.rows.length > 0) {
      await client.query('COMMIT');
      return res.json({ payment: existing.rows[0], reused: true });
    }

    const expiresAt = new Date(Date.now() + VA_EXPIRY_HOURS * 3600 * 1000);

    // Baris dibuat dulu supaya payment_id bisa dipakai sebagai order_id di
    // Midtrans. Satu percobaan bayar = satu baris = satu order_id unik, jadi
    // user yang mengulang setelah VA kedaluwarsa tidak ditolak "duplicate order".
    const ins = await client.query(
      `INSERT INTO payments (booking_id, payment_type, amount, expires_at, bank)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [booking_id, payment_type, amount, expiresAt, bank]
    );

    const payment = ins.rows[0];

    let vaNumber = null;
    let gatewayTxnId = null;

    if (midtrans.enabled) {
      const charged = await midtrans.core.charge({
        payment_type: 'bank_transfer',
        transaction_details: { order_id: payment.payment_id, gross_amount: amount },
        bank_transfer: { bank },
        custom_expiry: { unit: 'hour', expiry_duration: VA_EXPIRY_HOURS },
      });
      // Permata menaruh nomornya di field sendiri, bank lain di array va_numbers.
      vaNumber = charged.permata_va_number
        || (charged.va_numbers && charged.va_numbers[0] && charged.va_numbers[0].va_number)
        || null;
      gatewayTxnId = charged.transaction_id || null;
    } else {
      // Mode simulasi: nomor VA palsu yang bentuknya mirip aslinya supaya
      // halaman VA di frontend tetap bisa diuji tampilannya.
      vaNumber = `8${Date.now().toString().slice(-11)}`;
    }

    const done = await client.query(
      `UPDATE payments SET va_number = $2, gateway_transaction_id = $3
        WHERE payment_id = $1 RETURNING *`,
      [payment.payment_id, vaNumber, gatewayTxnId]
    );

    await client.query('COMMIT');
    res.status(201).json({ payment: done.rows[0], simulated: !midtrans.enabled });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    // Kegagalan dari Midtrans bukan bug kita — bedakan supaya frontend bisa
    // menyuruh user coba lagi, bukan menampilkan "terjadi kesalahan".
    if (err.httpStatusCode || err.ApiResponse) {
      console.error('[midtrans] charge gagal:', err.message);
      return res.status(502).json({ message: 'Gateway pembayaran sedang tidak bisa dihubungi' });
    }
    next(err);
  } finally {
    client.release();
  }
}

// POST /api/v1/payments/webhook  (TANPA auth — yang memanggil Midtrans)
// Keamanannya bukan dari token, tapi dari verifikasi signature SHA512.
async function webhook(req, res, next) {
  const body = req.body || {};

  if (!midtrans.enabled) {
    return res.status(503).json({ message: 'Midtrans tidak aktif di server ini' });
  }
  if (!midtrans.verifySignature(body)) {
    console.warn('[midtrans] webhook signature tidak cocok, order_id:', body.order_id);
    return res.status(403).json({ message: 'Signature tidak valid' });
  }

  const status = midtrans.mapStatus(body.transaction_status, body.fraud_status);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const pay = await client.query(
      `SELECT payment_id, gateway_status FROM payments WHERE payment_id = $1 FOR UPDATE`,
      [body.order_id]
    );

    if (pay.rows.length === 0) {
      await client.query('ROLLBACK');
      // 200, bukan 404: kalau kita balas error, Midtrans akan retry terus untuk
      // order_id yang memang tidak pernah ada di sini.
      return res.json({ message: 'Diabaikan, payment tidak dikenal' });
    }

    if (status === 'success') {
      await applySuccess(client, body.order_id, body.transaction_id);
    } else if (pay.rows[0].gateway_status !== 'success') {
      // Jangan pernah menurunkan status yang sudah sukses.
      await client.query(
        `UPDATE payments
            SET gateway_status = $2,
                gateway_transaction_id = COALESCE(gateway_transaction_id, $3)
          WHERE payment_id = $1`,
        [body.order_id, status, body.transaction_id || null]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'OK' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
}

// GET /api/v1/payments/booking/:bookingId  (login)
// Cadangan kalau webhook tidak masuk (mis. backend masih di localhost).
async function listByBooking(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT p.*
         FROM payments p
         JOIN bookings b ON b.booking_id = p.booking_id
        WHERE p.booking_id = $1 AND b.user_id = $2
        ORDER BY p.created_at`,
      [req.params.bookingId, req.user.user_id]
    );
    res.json({ payments: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/payments/:paymentId/simulate  (login)
// Jaring pengaman demo: menandai lunas tanpa gateway. Sengaja DIMATIKAN kalau
// Midtrans aktif — di sandbox sudah ada simulator resmi di dashboard, dan
// endpoint ini tidak boleh punya jalan hidup di production.
async function simulate(req, res, next) {
  if (midtrans.enabled) {
    return res.status(403).json({
      message: 'Midtrans aktif — gunakan simulator di dashboard Midtrans',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pay = await client.query(
      `SELECT p.payment_id
         FROM payments p
         JOIN bookings b ON b.booking_id = p.booking_id
        WHERE p.payment_id = $1 AND b.user_id = $2
        FOR UPDATE OF p`,
      [req.params.paymentId, req.user.user_id]
    );

    if (pay.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }

    const result = await applySuccess(client, req.params.paymentId, null);
    await client.query('COMMIT');

    res.json({ message: result.changed ? 'Pembayaran ditandai lunas' : 'Sudah lunas sebelumnya' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { charge, webhook, listByBooking, simulate };
