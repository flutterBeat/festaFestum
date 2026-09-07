const pool = require('../config/db');
const { acquireLock, lockHolder, releaseLock } = require('../config/redis');

const VALID_SLOTS = ['pagi', 'siang', 'malam'];
const VALID_EVENT_TYPES = [
  'wedding', 'engagement', 'graduation', 'gala_dinner', 'corporate_seminar',
];

// DP 30% dari total. Angka bisnis, bukan konstanta teknis — kalau nanti beda
// per vendor, pindahkan ke kolom di tabel vendors.
const DP_RATE = 0.3;

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// POST /api/v1/bookings  (login)
// Body: { service_id, event_date, time_slot, event_type, event_location_detail }
//
// Tiga lapis pertahanan terhadap double-booking, dari luar ke dalam:
//   1. Redis lock  — menolak lebih awal, sebelum sentuh DB
//   2. SELECT ... FOR UPDATE — dua request yang lolos lapis 1 diantrekan DB
//   3. UNIQUE (schedule_id) di bookings — jaring terakhir kalau 1 & 2 bocor
async function createBooking(req, res, next) {
  const { service_id, event_date, time_slot, event_type, event_location_detail } = req.body;

  if (!service_id || !event_date || !time_slot || !event_type || !event_location_detail) {
    return res.status(400).json({
      message: 'service_id, event_date, time_slot, event_type, dan event_location_detail wajib diisi',
    });
  }
  if (!isValidDate(event_date)) {
    return res.status(400).json({ message: 'event_date harus format YYYY-MM-DD' });
  }
  if (!VALID_SLOTS.includes(time_slot)) {
    return res.status(400).json({ message: 'time_slot tidak valid', allowed: VALID_SLOTS });
  }
  if (!VALID_EVENT_TYPES.includes(event_type)) {
    return res.status(400).json({ message: 'event_type tidak valid', allowed: VALID_EVENT_TYPES });
  }

  const userId = req.user.user_id;
  let vendorId = null;
  let weOwnTheLock = false;

  const client = await pool.connect();
  try {
    const svc = await client.query(
      `SELECT vendor_id, price, minimum_notice_days,
              ($2::date >= CURRENT_DATE + minimum_notice_days) AS notice_ok
       FROM services WHERE service_id = $1 AND is_active = TRUE`,
      [service_id, event_date]
    );

    if (svc.rows.length === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan atau sudah tidak aktif' });
    }

    const { vendor_id, price, minimum_notice_days, notice_ok } = svc.rows[0];
    vendorId = vendor_id;

    if (!notice_ok) {
      return res.status(400).json({
        message: `Layanan ini butuh pemesanan minimal ${minimum_notice_days} hari sebelum acara`,
      });
    }

    // Kalau user sudah hold slot ini lewat /schedules/hold, lock-nya sudah
    // atas namanya — jangan direbut ulang, cukup dipakai lalu dilepas di akhir.
    const holder = await lockHolder(vendor_id, event_date, time_slot);
    if (holder && holder !== userId) {
      return res.status(409).json({ message: 'Slot sedang diproses user lain' });
    }
    if (!holder) {
      const got = await acquireLock(vendor_id, event_date, time_slot, userId);
      if (!got) {
        return res.status(409).json({ message: 'Slot sedang diproses user lain' });
      }
    }
    weOwnTheLock = true;

    await client.query('BEGIN');

    // FOR UPDATE mengunci baris slot: request kedua menunggu di sini sampai
    // yang pertama commit, lalu melihat status sudah bukan 'available'.
    const sch = await client.query(
      `SELECT schedule_id FROM vendor_schedules
       WHERE vendor_id = $1 AND event_date = $2::date AND time_slot = $3::time_slot
         AND status = 'available'
       FOR UPDATE`,
      [vendor_id, event_date, time_slot]
    );

    if (sch.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Slot tidak tersedia' });
    }

    const scheduleId = sch.rows[0].schedule_id;
    const dpAmount = (Number(price) * DP_RATE).toFixed(2);

    await client.query(
      `UPDATE vendor_schedules SET status = 'held', updated_at = now()
       WHERE schedule_id = $1`,
      [scheduleId]
    );

    const booking = await client.query(
      `INSERT INTO bookings
         (user_id, service_id, schedule_id, event_type, event_location_detail,
          total_price, dp_amount, soft_lock_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now() + interval '24 hours')
       RETURNING *`,
      [userId, service_id, scheduleId, event_type, event_location_detail, price, dpAmount]
    );

    await client.query('COMMIT');

    res.status(201).json({ booking: booking.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
    // Lock dilepas apa pun hasilnya: kalau booking sukses, DB (status 'held')
    // yang jadi penjaga; kalau gagal, slot harus segera bebas untuk user lain.
    if (weOwnTheLock) await releaseLock(vendorId, event_date, time_slot, userId);
  }
}

// Booking 'pending' yang lewat 24 jam tanpa DP dibatalkan, slotnya dibebaskan.
// Satu statement, dijalankan berkala dari index.js.
// ponytail: setInterval di dalam proses app. Kalau nanti backend jalan >1
// instance, dua instance akan menyapu bersamaan — tidak merusak (query-nya
// idempoten), tapi pindahkan ke cron eksternal kalau mulai berisik.
async function expireStaleBookings() {
  try {
    const { rows } = await pool.query(
      `WITH expired AS (
         UPDATE bookings SET payment_status = 'expired', updated_at = now()
         WHERE payment_status = 'pending' AND soft_lock_expires_at < now()
         RETURNING schedule_id
       )
       UPDATE vendor_schedules SET status = 'available', updated_at = now()
       WHERE schedule_id IN (SELECT schedule_id FROM expired)
         AND status = 'held'
       RETURNING schedule_id`
    );
    if (rows.length) console.log(`[expiry] ${rows.length} slot dibebaskan`);
  } catch (err) {
    console.error('[expiry] gagal:', err.message);
  }
}

module.exports = { createBooking, expireStaleBookings };
