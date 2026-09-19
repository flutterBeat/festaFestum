const pool = require('../config/db');
const { acquireLock, lockHolder, LOCK_TTL_SECONDS } = require('../config/redis');
const { kunciShift, BOOKING_AKTIF } = require('../lib/kategori');

const VALID_SLOTS = ['pagi', 'siang', 'malam'];

// Rentang maksimal satu permintaan ketersediaan. Kalender cuma butuh
// sebulan; 92 hari memberi ruang untuk tampilan tiga bulan.
const MAX_RENTANG_HARI = 92;

// Sejauh apa ke depan vendor boleh dipesan. Dulu batasnya muncul sendiri dari
// data (seed cuma membuat 30 hari slot); sekarang ketersediaan tidak disimpan
// sama sekali, jadi batasnya harus disebut.
const HORIZON_HARI = 730;

// Format YYYY-MM-DD, sekaligus menolak tanggal ngawur seperti 2026-02-31.
function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// ------------------------------------------------------------
// Ketersediaan DITURUNKAN, tidak disimpan.
//
// vendor_schedules sekarang cuma berisi penutupan yang dibuat vendor; tidak
// ada baris berarti tersedia. Jadi sebuah slot tidak bisa dipesan kalau salah
// satu dari tiga ini benar:
//
//   1. vendor menutupnya          -> ada baris di vendor_schedules
//   2. shiftnya sudah terisi      -> ada pesanan aktif kunci_shift di jam itu
//   3. kapasitas harian habis     -> jumlah terpakai >= vendors.daily_capacity
//
// Ketiganya dihitung dari sumber yang sama dengan yang dibaca createBooking,
// jadi kalender tidak bisa lagi menawarkan slot yang pasti ditolak. Dulu bisa:
// statusnya disimpan sebagai kolom, dan kolom itu tidak ikut diperbarui saat
// vendor membuka shift baru di tanggal yang sudah terpakai.
// ------------------------------------------------------------

// Dipakai listAvailability (sebulan sekaligus) dan cekSatuSlot (satu titik).
// Nomor parameternya dioper karena kedua pemanggil punya urutan argumen yang
// berbeda — di cekSatuSlot, dari dan sampai adalah tanggal yang sama.
const sqlKetersediaan = (svc, dari, sampai) => `
  WITH svc AS (
    SELECT s.vendor_id, s.category, s.minimum_notice_days, v.daily_capacity
      FROM services s
      JOIN vendors  v ON v.vendor_id = s.vendor_id
     WHERE s.service_id = ${svc} AND s.is_active = TRUE
  ),
  hari AS (
    SELECT d::date AS event_date
      FROM generate_series(${dari}::date, ${sampai}::date, interval '1 day') d
  ),
  shift AS (
    SELECT unnest(ARRAY['pagi', 'siang', 'malam']::time_slot[]) AS time_slot
  ),
  aktif AS (
    SELECT b.event_date, b.time_slot, b.kunci_shift, b.quantity
      FROM bookings b, svc
     WHERE b.vendor_id = svc.vendor_id
       AND b.event_date BETWEEN ${dari}::date AND ${sampai}::date
       AND b.${BOOKING_AKTIF}
  ),
  terpakai AS (
    SELECT event_date,
           SUM(CASE WHEN kunci_shift THEN 1 ELSE quantity END)::int AS jumlah
      FROM aktif GROUP BY event_date
  )
  SELECT h.event_date::text AS event_date,
         sh.time_slot,
         CASE
           WHEN EXISTS (
             SELECT 1 FROM vendor_schedules vs, svc
              WHERE vs.vendor_id = svc.vendor_id
                AND vs.event_date = h.event_date
                AND vs.time_slot = sh.time_slot
           ) THEN 'blocked'
           WHEN EXISTS (
             SELECT 1 FROM aktif a
              WHERE a.event_date = h.event_date
                AND a.time_slot = sh.time_slot
                AND a.kunci_shift
           ) THEN 'booked'
           WHEN COALESCE((SELECT jumlah FROM terpakai t WHERE t.event_date = h.event_date), 0)
                >= (SELECT daily_capacity FROM svc) THEN 'booked'
           ELSE 'available'
         END AS status
    FROM hari h CROSS JOIN shift sh
   ORDER BY h.event_date, sh.time_slot`;

// Verdict satu slot, dipakai /schedules/check dan /schedules/hold supaya
// keduanya tidak pernah menjawab beda untuk pertanyaan yang sama.
async function cekSatuSlot(service_id, event_date, time_slot) {
  const q = await pool.query(
    `SELECT s.vendor_id, s.service_name, s.price, s.minimum_notice_days, s.category,
            ($2::date >= CURRENT_DATE + s.minimum_notice_days) AS notice_ok,
            ($2::date <= CURRENT_DATE + ${HORIZON_HARI}) AS horizon_ok,
            (SELECT status FROM (${sqlKetersediaan('$1', '$2', '$2')}) k
              WHERE k.time_slot = $3::time_slot) AS status
       FROM services s
      WHERE s.service_id = $1 AND s.is_active = TRUE`,
    [service_id, event_date, time_slot]
  );
  return q.rows[0] || null;
}

// POST /api/v1/schedules  (vendor_owner)
// Body: { slots: [{ event_date, time_slot }, ...] }
//
// ARTINYA TERBALIK dari sebelumnya: dulu ini MEMBUKA slot, sekarang MENUTUP.
// Vendor tersedia secara bawaan, jadi yang perlu dicatat cuma kapan dia tidak
// menerima pesanan. Bentuk body-nya sengaja dipertahankan supaya pemanggil
// lama tidak perlu menyusun ulang payload-nya.
async function tutupSlot(req, res, next) {
  try {
    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: 'slots wajib diisi dan berupa array' });
    }
    if (slots.length > 100) {
      return res.status(400).json({ message: 'Maksimal 100 slot per request' });
    }
    for (const s of slots) {
      if (!s || !isValidDate(s.event_date) || !VALID_SLOTS.includes(s.time_slot)) {
        return res.status(400).json({
          message: 'Tiap slot butuh event_date (YYYY-MM-DD) dan time_slot yang valid',
          allowed_time_slots: VALID_SLOTS,
        });
      }
    }

    const vendor = await pool.query(
      'SELECT vendor_id FROM vendors WHERE owner_user_id = $1',
      [req.user.user_id]
    );
    if (vendor.rows.length === 0) {
      return res.status(404).json({ message: 'Anda belum memiliki profil vendor' });
    }
    const vendorId = vendor.rows[0].vendor_id;

    // Menutup tanggal yang sudah terlanjur dipesan akan membuat kalender
    // berbohong ke customer yang pesanannya sudah diterima. Ditolak, dan
    // tanggal bermasalahnya disebutkan supaya vendor tahu harus membatalkan
    // yang mana lebih dulu.
    const bentrok = await pool.query(
      `SELECT DISTINCT b.event_date::text AS event_date, b.time_slot
         FROM bookings b
         JOIN jsonb_to_recordset($2::jsonb) AS d(event_date text, time_slot text)
           ON d.event_date::date = b.event_date AND d.time_slot::time_slot = b.time_slot
        WHERE b.vendor_id = $1 AND b.${BOOKING_AKTIF}`,
      [vendorId, JSON.stringify(slots)]
    );
    if (bentrok.rows.length > 0) {
      return res.status(409).json({
        message: 'Ada pesanan aktif di slot yang mau ditutup',
        bentrok: bentrok.rows,
      });
    }

    const result = await pool.query(
      `INSERT INTO vendor_schedules (vendor_id, event_date, time_slot, status)
       SELECT $1, d.event_date::date, d.time_slot::time_slot, 'blocked'
       FROM jsonb_to_recordset($2::jsonb) AS d(event_date text, time_slot text)
       ON CONFLICT (vendor_id, event_date, time_slot) DO NOTHING
       RETURNING schedule_id, event_date, time_slot, status`,
      [vendorId, JSON.stringify(slots)]
    );

    res.status(201).json({
      ditutup: result.rows.length,
      dilewati: slots.length - result.rows.length,
      schedules: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/services/:serviceId/availability?from=YYYY-MM-DD&to=YYYY-MM-DD  (public)
//
// Dipakai kalender pemesanan. Bentuk responsnya sengaja tidak berubah walau
// sumbernya berubah total: dulu membaca baris, sekarang membangkitkan grid
// lalu mengurangi pengecualian.
async function listAvailability(req, res, next) {
  try {
    const { serviceId } = req.params;
    const { from, to } = req.query;

    if (!isValidDate(from) || !isValidDate(to)) {
      return res.status(400).json({ message: 'from dan to wajib diisi, format YYYY-MM-DD' });
    }
    if (from > to) {
      return res.status(400).json({ message: 'from tidak boleh setelah to' });
    }

    // Batas rentang supaya satu request tidak bisa menarik data bertahun-tahun.
    const hari = (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000;
    if (hari > MAX_RENTANG_HARI) {
      return res.status(400).json({ message: `Rentang maksimal ${MAX_RENTANG_HARI} hari` });
    }

    const svc = await pool.query(
      `SELECT s.vendor_id, s.minimum_notice_days, v.daily_capacity,
              (CURRENT_DATE + s.minimum_notice_days)::text AS paling_cepat,
              (CURRENT_DATE + ${HORIZON_HARI})::text AS paling_lama
         FROM services s
         JOIN vendors  v ON v.vendor_id = s.vendor_id
        WHERE s.service_id = $1 AND s.is_active = TRUE`,
      [serviceId]
    );

    if (svc.rows.length === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan atau sudah tidak aktif' });
    }

    const { vendor_id, minimum_notice_days, daily_capacity, paling_cepat, paling_lama } = svc.rows[0];
    const slots = await pool.query(sqlKetersediaan('$1', '$2', '$3'), [serviceId, from, to]);

    res.json({
      service_id: serviceId,
      vendor_id,
      minimum_notice_days,
      daily_capacity,
      // Tanggal paling awal yang boleh dipesan. Dihitung di DB supaya zona
      // waktu server yang dipakai, bukan zona waktu browser pemesan.
      earliest_date: paling_cepat,
      latest_date: paling_lama,
      data: slots.rows,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/schedules/check  (public)
// Body: { service_id, event_date, time_slot }
// Menjawab satu pertanyaan: slot ini bisa dipesan atau tidak, dan kenapa.
async function checkAvailability(req, res, next) {
  try {
    const { service_id, event_date, time_slot } = req.body;

    if (!service_id || !event_date || !time_slot) {
      return res.status(400).json({ message: 'service_id, event_date, dan time_slot wajib diisi' });
    }
    if (!isValidDate(event_date)) {
      return res.status(400).json({ message: 'event_date harus format YYYY-MM-DD' });
    }
    if (!VALID_SLOTS.includes(time_slot)) {
      return res.status(400).json({ message: 'time_slot tidak valid', allowed: VALID_SLOTS });
    }

    const r = await cekSatuSlot(service_id, event_date, time_slot);
    if (!r) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan atau sudah tidak aktif' });
    }

    const base = {
      service_id,
      vendor_id: r.vendor_id,
      service_name: r.service_name,
      price: r.price,
      event_date,
      time_slot,
      minimum_notice_days: r.minimum_notice_days,
    };

    if (!r.notice_ok) {
      return res.json({
        ...base,
        available: false,
        reason: `Layanan ini butuh pemesanan minimal ${r.minimum_notice_days} hari sebelum acara`,
      });
    }
    if (!r.horizon_ok) {
      return res.json({
        ...base,
        available: false,
        reason: 'Tanggal terlalu jauh ke depan',
      });
    }
    if (r.status !== 'available') {
      // 'blocked' = vendor menutup tanggalnya sendiri; 'booked' = kapasitas
      // hariannya habis atau shift itu sudah terisi. Dua sebab yang berbeda
      // buat pemesan, jadi kalimatnya juga dibedakan.
      return res.json({
        ...base,
        available: false,
        reason: r.status === 'blocked'
          ? 'Vendor tidak menerima pesanan di tanggal ini'
          : 'Vendor sudah penuh di tanggal ini',
      });
    }

    // Slot bebas menurut DB, tapi mungkin sedang dipegang user lain di
    // checkout. Lock cuma dipasang untuk kategori yang mengunci shift.
    if (kunciShift(r.category)) {
      const holder = await lockHolder(r.vendor_id, event_date, time_slot);
      if (holder && holder !== (req.user && req.user.user_id)) {
        return res.json({ ...base, available: false, reason: 'Slot sedang diproses user lain' });
      }
    }

    res.json({ ...base, available: true, reason: null });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/schedules/hold  (login)
// Dipanggil saat user klik "Pesan" dan masuk halaman checkout. Inilah gunanya
// Redis: menahan slot SEBELUM baris booking dibuat, supaya user lain langsung
// ditolak alih-alih baru tahu setelah capek isi form.
//
// Untuk florist & sewa jas/kebaya tidak ada yang ditahan: kapasitasnya lebih
// dari satu, jadi memaksa mereka antre satu-satu di checkout cuma menghalangi
// pembeli tanpa mencegah apa pun.
async function holdSlot(req, res, next) {
  try {
    const { service_id, event_date, time_slot } = req.body;

    if (!service_id || !isValidDate(event_date) || !VALID_SLOTS.includes(time_slot)) {
      return res.status(400).json({
        message: 'service_id, event_date (YYYY-MM-DD), dan time_slot wajib diisi dengan benar',
        allowed_time_slots: VALID_SLOTS,
      });
    }

    const r = await cekSatuSlot(service_id, event_date, time_slot);
    if (!r) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan atau sudah tidak aktif' });
    }
    if (!r.notice_ok || !r.horizon_ok || r.status !== 'available') {
      return res.status(409).json({ message: 'Slot tidak tersedia' });
    }

    if (kunciShift(r.category)) {
      const got = await acquireLock(r.vendor_id, event_date, time_slot, req.user.user_id);
      if (!got) {
        return res.status(409).json({ message: 'Slot sedang diproses user lain, coba beberapa menit lagi' });
      }
    }

    res.json({
      vendor_id: r.vendor_id,
      event_date,
      time_slot,
      hold_expires_in_seconds: kunciShift(r.category) ? LOCK_TTL_SECONDS : 0,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/schedules/me?from=YYYY-MM-DD&to=YYYY-MM-DD  (role: vendor_owner)
// Mengisi kalender di halaman Jadwal vendor.
//
// Membalas GRID penuh, bukan cuma baris yang ada — karena "tidak ada baris"
// sekarang berarti tersedia, dan halaman jadwal perlu membedakan tersedia,
// ditutup, dan terisi. Sebulan = 90 baris.
async function listMySchedules(req, res, next) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'from dan to wajib diisi (YYYY-MM-DD)' });
    }
    if (!isValidDate(from) || !isValidDate(to)) {
      return res.status(400).json({ message: 'from dan to harus format YYYY-MM-DD' });
    }
    if (from > to) {
      return res.status(400).json({ message: 'from tidak boleh setelah to' });
    }
    const hari = (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000;
    if (hari > MAX_RENTANG_HARI) {
      return res.status(400).json({ message: `Rentang maksimal ${MAX_RENTANG_HARI} hari` });
    }

    const vendor = await pool.query(
      'SELECT v.vendor_id, v.daily_capacity FROM vendors v WHERE v.owner_user_id = $1',
      [req.user.user_id]
    );
    if (vendor.rows.length === 0) {
      return res.status(404).json({ message: 'Profil vendor belum dibuat' });
    }
    const { vendor_id, daily_capacity } = vendor.rows[0];

    // Pesanan yang menempel di slot ikut dibawa, supaya kalender bisa
    // menampilkan siapa yang memesan tanpa panggilan kedua. Untuk kategori
    // berkapasitas, satu slot bisa punya lebih dari satu pesanan — jumlahnya
    // ikut dikirim supaya vendor tidak cuma melihat satu nama.
    const { rows } = await pool.query(
      `WITH hari AS (
         SELECT d::date AS event_date
           FROM generate_series($2::date, $3::date, interval '1 day') d
       ),
       shift AS (
         SELECT unnest(ARRAY['pagi', 'siang', 'malam']::time_slot[]) AS time_slot
       ),
       aktif AS (
         SELECT b.booking_id, b.event_date, b.time_slot, b.kunci_shift,
                b.quantity, b.payment_status, u.name AS customer_name
           FROM bookings b
           JOIN users u ON u.user_id = b.user_id
          WHERE b.vendor_id = $1
            AND b.event_date BETWEEN $2::date AND $3::date
            AND b.${BOOKING_AKTIF}
       ),
       terpakai AS (
         SELECT event_date,
                SUM(CASE WHEN kunci_shift THEN 1 ELSE quantity END)::int AS jumlah
           FROM aktif GROUP BY event_date
       )
       SELECT h.event_date::text AS event_date,
              sh.time_slot,
              tutup.schedule_id,
              CASE
                WHEN tutup.schedule_id IS NOT NULL THEN 'blocked'
                WHEN isi.booking_id IS NOT NULL THEN 'booked'
                WHEN COALESCE(t.jumlah, 0) >= $4 THEN 'booked'
                ELSE 'available'
              END AS status,
              isi.booking_id, isi.payment_status, isi.customer_name,
              COALESCE(isi.jumlah_pesanan, 0)::int AS jumlah_pesanan
         FROM hari h
         CROSS JOIN shift sh
         LEFT JOIN vendor_schedules tutup
                ON tutup.vendor_id = $1
               AND tutup.event_date = h.event_date
               AND tutup.time_slot = sh.time_slot
         LEFT JOIN LATERAL (
           SELECT a.booking_id, a.payment_status, a.customer_name,
                  count(*) OVER () AS jumlah_pesanan
             FROM aktif a
            WHERE a.event_date = h.event_date AND a.time_slot = sh.time_slot
            ORDER BY a.booking_id
            LIMIT 1
         ) isi ON TRUE
         LEFT JOIN terpakai t ON t.event_date = h.event_date
        ORDER BY h.event_date, sh.time_slot`,
      [vendor_id, from, to, daily_capacity]
    );

    res.json({ data: rows, daily_capacity });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/schedules/:scheduleId  (role: vendor_owner)
//
// Membuka kembali tanggal yang ditutup. Kebalikan arti dari sebelumnya, di
// mana endpoint ini MENUTUP slot dengan menghapus barisnya.
//
// Kepemilikan ikut di WHERE lewat subquery vendor. Baris di tabel ini pasti
// penutupan (dijaga CHECK di migrasi 013), jadi tidak ada lagi risiko
// menghapus slot yang sedang dipesan.
async function bukaSlot(req, res, next) {
  try {
    const { rows } = await pool.query(
      `DELETE FROM vendor_schedules sch
        WHERE sch.schedule_id = $1
          AND sch.vendor_id IN (SELECT vendor_id FROM vendors WHERE owner_user_id = $2)
        RETURNING sch.schedule_id`,
      [req.params.scheduleId, req.user.user_id]
    );

    if (rows.length === 0) {
      // Bisa berarti: bukan milik dia, atau tidak ada. Dua-duanya 404 supaya
      // tidak bocor penutupan mana yang ada dan milik siapa.
      return res.status(404).json({ message: 'Penutupan tidak ditemukan' });
    }

    res.json({ message: 'Tanggal dibuka kembali', schedule_id: rows[0].schedule_id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  tutupSlot, checkAvailability, listAvailability, holdSlot, listMySchedules,
  bukaSlot,
};
