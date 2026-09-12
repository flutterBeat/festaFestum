-- 005: buku besar pencairan dana vendor (payout).
--
-- Uang TIDAK pernah mengalir ke vendor lewat gateway: Midtrans hanya
-- mengantar dana ke akun merchant platform, dan meneruskannya ke vendor
-- butuh produk lain (Iris) yang sudah ditolak untuk proyek ini. Jadi payout
-- di sini adalah catatan internal: vendor mengajukan, admin menyetujui atau
-- menolak, dan transfer sungguhannya dilakukan di luar sistem.
--
-- Saldo TIDAK disimpan sebagai kolom. Saldo dihitung ulang dari pembayaran
-- yang sukses dikurangi payout yang masih hidup ('pending' + 'paid'), supaya
-- tidak ada dua sumber kebenaran yang bisa berselisih.

BEGIN;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS payouts (
  payout_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status       payout_status NOT NULL DEFAULT 'pending',
  -- Catatan admin saat menyetujui/menolak; wajib diisi saat menolak supaya
  -- vendor tahu alasannya.
  note         TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ,
  decided_by   UUID REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_payouts_vendor ON payouts (vendor_id, status);

COMMIT;
