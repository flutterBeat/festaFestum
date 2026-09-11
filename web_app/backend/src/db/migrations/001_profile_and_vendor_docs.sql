-- Migrasi 001 — profil user & dokumen verifikasi vendor (mockup 9 Sep 2026).
-- Jalankan sekali di DB yang sudah ada; schema.sql sudah ikut diperbarui
-- untuk DB baru, jadi jangan jalankan keduanya di database yang sama.

BEGIN;

-- ---- Profil user (halaman "Pengaturan Profil & Keamanan") ----
-- name yang sudah ada = nama panggilan/display. full_name = nama sesuai KTP,
-- dipisah karena mockup memakainya untuk kontrak/SPK resmi.
ALTER TABLE users
  ADD COLUMN full_name          VARCHAR(150),
  ADD COLUMN birth_date         DATE,
  ADD COLUMN avatar_url         TEXT,
  ADD COLUMN shipping_address   TEXT,
  ADD COLUMN shipping_note      VARCHAR(200),
  ADD COLUMN notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ---- Pendaftaran vendor bertahap ----
-- Form "Daftar Akun Vendor Baru" belum menanyakan kota, padahal baris vendor
-- harus sudah ada di langkah 1 supaya dokumen langkah 2 punya vendor_id.
-- Kota diisi belakangan; vendor tanpa kota otomatis tidak muncul di filter
-- pencarian (v.city = $n tidak pernah cocok dengan NULL), jadi aman.
ALTER TABLE vendors ALTER COLUMN city DROP NOT NULL;

-- ---- Dokumen verifikasi (KTP / NPWP / SIUP) ----
CREATE TYPE vendor_document_type AS ENUM ('ktp', 'npwp', 'siup');
CREATE TYPE vendor_document_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE vendor_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  doc_type    vendor_document_type NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  -- ponytail: isi file belum disimpan di mana pun, kolom ini menunggu object
  -- storage. KTP & NPWP itu PII; simpan bytes-nya baru setelah ada bucket
  -- privat + kebijakan retensi, jangan ke folder yang ikut ter-serve publik.
  file_url    TEXT,
  status      vendor_document_status NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, doc_type)
);

CREATE INDEX idx_vendor_documents_vendor ON vendor_documents (vendor_id);

COMMIT;
