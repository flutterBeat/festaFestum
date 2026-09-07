const pool = require('../config/db');

const VALID_CATEGORIES = [
  'event_organizer', 'florist', 'attire_rental', 'makeup_artist', 'photographer',
];

// Helper: pastikan vendor ini milik user yang login
async function assertVendorOwnership(vendorId, userId) {
  const result = await pool.query(
    'SELECT vendor_id FROM vendors WHERE vendor_id = $1 AND owner_user_id = $2',
    [vendorId, userId]
  );
  return result.rows.length > 0;
}

// POST /api/v1/vendors/:vendorId/services  (pemilik vendor)
async function createService(req, res, next) {
  try {
    const { vendorId } = req.params;
    const { service_name, category, description, price, minimum_notice_days } = req.body;

    if (!service_name || !category || price === undefined) {
      return res.status(400).json({ message: 'service_name, category, dan price wajib diisi' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'category tidak valid', allowed: VALID_CATEGORIES });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ message: 'price tidak boleh negatif' });
    }

    const isOwner = await assertVendorOwnership(vendorId, req.user.user_id);
    if (!isOwner) {
      return res.status(404).json({ message: 'Vendor tidak ditemukan atau bukan milik Anda' });
    }

    const result = await pool.query(
      `INSERT INTO services
         (vendor_id, service_name, category, description, price, minimum_notice_days)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 7))
       RETURNING *`,
      [vendorId, service_name, category, description || null, price,
       minimum_notice_days ?? null]
    );

    res.status(201).json({ service: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/vendors/:vendorId/services  (public)
async function listServices(req, res, next) {
  try {
    const { vendorId } = req.params;

    const result = await pool.query(
      `SELECT service_id, service_name, category, description, price,
              minimum_notice_days, is_active, created_at
       FROM services
       WHERE vendor_id = $1 AND is_active = TRUE
       ORDER BY price ASC`,
      [vendorId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/services/:serviceId  (pemilik vendor)
async function updateService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const { service_name, category, description, price, minimum_notice_days, is_active } = req.body;

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'category tidak valid', allowed: VALID_CATEGORIES });
    }

    // Kepemilikan diverifikasi lewat join ke vendors di dalam subquery.
    const result = await pool.query(
      `UPDATE services SET
         service_name        = COALESCE($1, service_name),
         category            = COALESCE($2, category),
         description         = COALESCE($3, description),
         price               = COALESCE($4, price),
         minimum_notice_days = COALESCE($5, minimum_notice_days),
         is_active           = COALESCE($6, is_active),
         updated_at          = now()
       WHERE service_id = $7
         AND vendor_id IN (SELECT vendor_id FROM vendors WHERE owner_user_id = $8)
       RETURNING *`,
      [service_name || null, category || null, description || null,
       price ?? null, minimum_notice_days ?? null, is_active ?? null,
       serviceId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan atau bukan milik Anda' });
    }

    res.json({ service: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/services/:serviceId  (soft delete)
// Sengaja tidak menghapus baris, karena booking lama masih mereferensikan
// service ini. Cukup nonaktifkan agar tidak muncul di pencarian.
async function deactivateService(req, res, next) {
  try {
    const { serviceId } = req.params;

    const result = await pool.query(
      `UPDATE services SET is_active = FALSE, updated_at = now()
       WHERE service_id = $1
         AND vendor_id IN (SELECT vendor_id FROM vendors WHERE owner_user_id = $2)
       RETURNING service_id`,
      [serviceId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan atau bukan milik Anda' });
    }

    res.json({ message: 'Layanan berhasil dinonaktifkan' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createService, listServices, updateService, deactivateService };
