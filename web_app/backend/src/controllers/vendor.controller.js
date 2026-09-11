const pool = require('../config/db');

const VALID_CITIES = [
  'jakarta_pusat', 'jakarta_utara', 'jakarta_barat', 'jakarta_selatan', 'jakarta_timur',
  'bogor', 'depok', 'tangerang', 'tangerang_selatan', 'bekasi',
];

const VALID_CATEGORIES = [
  'event_organizer', 'florist', 'attire_rental', 'makeup_artist', 'photographer',
];

// POST /api/v1/vendors  (role: vendor_owner)
// Satu akun hanya boleh punya satu profil vendor.
async function createVendor(req, res, next) {
  try {
    const { business_name, city, address, description } = req.body;

    if (!business_name) {
      return res.status(400).json({ message: 'business_name wajib diisi' });
    }

    // city opsional di langkah 1 pendaftaran vendor; vendor tanpa kota tidak
    // akan muncul di hasil pencarian sampai dilengkapi lewat PATCH.
    if (city && !VALID_CITIES.includes(city)) {
      return res.status(400).json({ message: 'city tidak valid', allowed: VALID_CITIES });
    }

    const existing = await pool.query(
      'SELECT vendor_id FROM vendors WHERE owner_user_id = $1',
      [req.user.user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Akun ini sudah memiliki profil vendor' });
    }

    const result = await pool.query(
      `INSERT INTO vendors (owner_user_id, business_name, city, address, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.user_id, business_name, city || null, address || null, description || null]
    );

    res.status(201).json({ vendor: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/vendors  (public)
// Filter: ?city=&category=&min_rating=&page=&limit=
// category difilter lewat services, karena satu vendor bisa lintas kategori.
async function listVendors(req, res, next) {
  try {
    const { city, category, min_rating } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];

    if (city) {
      if (!VALID_CITIES.includes(city)) {
        return res.status(400).json({ message: 'city tidak valid', allowed: VALID_CITIES });
      }
      values.push(city);
      conditions.push(`v.city = $${values.length}`);
    }

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: 'category tidak valid', allowed: VALID_CATEGORIES });
      }
      values.push(category);
      conditions.push(`EXISTS (
        SELECT 1 FROM services s
        WHERE s.vendor_id = v.vendor_id
          AND s.category = $${values.length}
          AND s.is_active = TRUE
      )`);
    }

    if (min_rating) {
      const rating = parseFloat(min_rating);
      if (Number.isNaN(rating)) {
        return res.status(400).json({ message: 'min_rating harus berupa angka' });
      }
      values.push(rating);
      conditions.push(`v.rating_avg >= $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    values.push(limit, offset);

    const result = await pool.query(
      `SELECT
         v.vendor_id, v.business_name, v.city, v.description,
         v.is_verified, v.rating_avg, v.rating_count,
         COALESCE(
           ARRAY(
             SELECT DISTINCT s.category::text FROM services s
             WHERE s.vendor_id = v.vendor_id AND s.is_active = TRUE
           ), '{}'
         ) AS categories,
         (SELECT MIN(s.price) FROM services s
          WHERE s.vendor_id = v.vendor_id AND s.is_active = TRUE) AS price_start_from
       FROM vendors v
       ${whereClause}
       ORDER BY v.rating_avg DESC, v.rating_count DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM vendors v ${whereClause}`,
      values.slice(0, values.length - 2)
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/vendors/me  (role: vendor_owner)
// Harus didaftarkan SEBELUM route /:vendorId agar "me" tidak dibaca sebagai UUID.
async function getMyVendor(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM vendors WHERE owner_user_id = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Anda belum memiliki profil vendor' });
    }

    res.json({ vendor: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/vendors/:vendorId  (public)
async function getVendorDetail(req, res, next) {
  try {
    const { vendorId } = req.params;

    const vendorResult = await pool.query(
      `SELECT vendor_id, business_name, city, address, description,
              is_verified, rating_avg, rating_count, created_at
       FROM vendors WHERE vendor_id = $1`,
      [vendorId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor tidak ditemukan' });
    }

    const [servicesResult, imagesResult] = await Promise.all([
      pool.query(
        `SELECT service_id, service_name, category, description, price,
                minimum_notice_days
         FROM services
         WHERE vendor_id = $1 AND is_active = TRUE
         ORDER BY price ASC`,
        [vendorId]
      ),
      pool.query(
        `SELECT image_id, image_url, caption
         FROM portfolio_images
         WHERE vendor_id = $1
         ORDER BY sort_order ASC`,
        [vendorId]
      ),
    ]);

    res.json({
      vendor: vendorResult.rows[0],
      services: servicesResult.rows,
      portfolio: imagesResult.rows,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/vendors/:vendorId  (pemilik vendor)
async function updateVendor(req, res, next) {
  try {
    const { vendorId } = req.params;
    const { business_name, city, address, description } = req.body;

    if (city && !VALID_CITIES.includes(city)) {
      return res.status(400).json({ message: 'city tidak valid', allowed: VALID_CITIES });
    }

    // Kepemilikan dicek langsung di klausa WHERE, sehingga vendor lain
    // tidak bisa mengubah data walau menebak vendor_id.
    const result = await pool.query(
      `UPDATE vendors SET
         business_name = COALESCE($1, business_name),
         city          = COALESCE($2, city),
         address       = COALESCE($3, address),
         description   = COALESCE($4, description),
         updated_at    = now()
       WHERE vendor_id = $5 AND owner_user_id = $6
       RETURNING *`,
      [business_name || null, city || null, address || null, description || null,
       vendorId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor tidak ditemukan atau bukan milik Anda' });
    }

    res.json({ vendor: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------
// Dokumen verifikasi vendor (KTP / NPWP / SIUP)
// Hanya metadata berkas yang disimpan; lihat catatan di schema.sql.
// ------------------------------------------------------------
const VALID_DOC_TYPES = ['ktp', 'npwp', 'siup'];

// Vendor selalu dicari lewat owner_user_id, tidak pernah lewat id dari client,
// jadi tidak ada jalan untuk menyentuh dokumen vendor orang lain.
async function findMyVendorId(userId) {
  const result = await pool.query(
    'SELECT vendor_id FROM vendors WHERE owner_user_id = $1',
    [userId]
  );
  return result.rows[0]?.vendor_id || null;
}

// PUT /api/v1/vendors/me/documents/:docType  (role: vendor_owner)
// Unggah ulang jenis yang sama menimpa baris lama dan mengulang kurasi.
async function upsertMyDocument(req, res, next) {
  try {
    const docType = req.params.docType;
    const { file_name } = req.body;

    if (!VALID_DOC_TYPES.includes(docType)) {
      return res.status(400).json({ message: 'Jenis dokumen tidak valid', allowed: VALID_DOC_TYPES });
    }

    if (!file_name || typeof file_name !== 'string') {
      return res.status(400).json({ message: 'file_name wajib diisi' });
    }

    const vendorId = await findMyVendorId(req.user.user_id);
    if (!vendorId) {
      return res.status(404).json({ message: 'Anda belum memiliki profil vendor' });
    }

    const result = await pool.query(
      `INSERT INTO vendor_documents (vendor_id, doc_type, file_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (vendor_id, doc_type) DO UPDATE
         SET file_name = EXCLUDED.file_name,
             status      = 'pending',
             uploaded_at = now()
       RETURNING document_id, doc_type, file_name, status, uploaded_at`,
      [vendorId, docType, file_name.slice(0, 255)]
    );

    res.status(201).json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/vendors/me/documents  (role: vendor_owner)
async function listMyDocuments(req, res, next) {
  try {
    const vendorId = await findMyVendorId(req.user.user_id);
    if (!vendorId) {
      return res.status(404).json({ message: 'Anda belum memiliki profil vendor' });
    }

    const result = await pool.query(
      `SELECT document_id, doc_type, file_name, status, uploaded_at
       FROM vendor_documents WHERE vendor_id = $1
       ORDER BY uploaded_at ASC`,
      [vendorId]
    );

    res.json({ documents: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createVendor, listVendors, getMyVendor, getVendorDetail, updateVendor,
  upsertMyDocument, listMyDocuments,
};
