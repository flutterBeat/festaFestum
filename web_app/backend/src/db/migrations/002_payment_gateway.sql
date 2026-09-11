-- 002: Kolom yang dibutuhkan tabel payments untuk bicara dengan Midtrans.
-- Jalankan setelah 001_profile_and_vendor_docs.sql.

BEGIN;

ALTER TABLE payments
  -- Batas waktu bayar. WAJIB dari DB, bukan dihitung di browser: kalau user
  -- refresh halaman VA atau ganti perangkat, hitungannya harus tetap sama.
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS va_number  VARCHAR(64),
  ADD COLUMN IF NOT EXISTS bank       VARCHAR(20);

-- Midtrans mengirim notifikasi yang sama berkali-kali (retry sampai kita balas
-- 200). Tanpa unique ini, satu pembayaran bisa tercatat dobel dan saldo vendor
-- ikut dobel. Partial index karena baris mode simulasi tidak punya id gateway.
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_txn_uniq
  ON payments (gateway_transaction_id)
  WHERE gateway_transaction_id IS NOT NULL;

-- (Index untuk booking_id tidak dibuat di sini: schema.sql sudah punya
--  idx_payments_booking. Index kembar cuma memperlambat INSERT tanpa guna.)

-- Satu booking hanya boleh punya SATU pembayaran sukses per jenis (DP /
-- pelunasan). Ini jaring terakhir kalau logika di controller bocor.
CREATE UNIQUE INDEX IF NOT EXISTS payments_booking_type_success_uniq
  ON payments (booking_id, payment_type)
  WHERE gateway_status = 'success';

COMMIT;
