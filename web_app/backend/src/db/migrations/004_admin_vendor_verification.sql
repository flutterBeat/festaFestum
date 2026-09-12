-- 004: jejak kurasi vendor untuk Pusat Kendali admin.
--
-- Status "terverifikasi" sudah ada sejak awal (vendors.is_verified), tapi
-- tidak ada catatan SIAPA memutuskan, KAPAN, dan ALASANNYA. Mockup admin
-- meminta formulir catatan kurasi yang bisa dibaca vendor pemohon, dan
-- penolakan tanpa alasan bikin vendor tidak tahu harus memperbaiki apa.
--
-- Sengaja tiga kolom di tabel vendors, bukan tabel audit terpisah: yang
-- dibutuhkan cuma keputusan TERAKHIR per vendor, dan riwayat lengkap tidak
-- dipakai halaman mana pun.
-- ponytail: keputusan terakhir saja. Upgrade kalau butuh riwayat banding:
-- tabel vendor_verification_events (vendor_id, admin_id, action, note, at).

BEGIN;

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS verification_note TEXT,
  ADD COLUMN IF NOT EXISTS verified_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by       UUID REFERENCES users(user_id) ON DELETE SET NULL;

COMMIT;
