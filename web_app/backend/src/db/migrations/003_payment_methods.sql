-- 003: payments dibikin generik supaya muat semua metode Midtrans.
--
-- Sebelumnya kolomnya `va_number` + `bank`, yang cuma pas untuk Virtual
-- Account. Metode lain bentuknya beda-beda: QRIS mengembalikan URL gambar QR,
-- Indomaret/Alfamart mengembalikan kode bayar, Mandiri mengembalikan bill_key
-- + biller_code, Akulaku/Kredivo mengembalikan redirect_url.
--
-- Menambah satu kolom tiap metode akan bikin tabel penuh kolom NULL. Jadi
-- dipakai satu kolom `details` JSONB, dan `method` yang menentukan isinya.
-- Aman diubah sekarang karena belum ada transaksi asli.

BEGIN;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS method  VARCHAR(30),
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Pindahkan data lama (dari uji) ke bentuk baru, supaya tidak ada baris yatim.
UPDATE payments
   SET method = COALESCE(bank, 'bca') || '_va',
       details = jsonb_strip_nulls(
         jsonb_build_object('va_number', va_number, 'bank', bank)
       )
 WHERE method IS NULL;

ALTER TABLE payments
  DROP COLUMN IF EXISTS va_number,
  DROP COLUMN IF EXISTS bank;

ALTER TABLE payments
  ALTER COLUMN method SET NOT NULL;

COMMIT;
