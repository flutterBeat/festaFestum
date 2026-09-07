-- ============================================================
-- FESTA FESTUM - Database Schema (PostgreSQL)
-- Marketplace vendor acara formal (WO, Florist, Jas/Kebaya, MUA, Fotografer)
-- Scope MVP: JABODETABEK
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- untuk gen_random_uuid()

-- ------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('customer', 'vendor_owner', 'admin');

CREATE TYPE vendor_category AS ENUM (
  'event_organizer', 'florist', 'attire_rental', 'makeup_artist', 'photographer'
);

CREATE TYPE jabodetabek_city AS ENUM (
  'jakarta_pusat', 'jakarta_utara', 'jakarta_barat', 'jakarta_selatan', 'jakarta_timur',
  'bogor', 'depok', 'tangerang', 'tangerang_selatan', 'bekasi'
);

CREATE TYPE event_type AS ENUM (
  'wedding', 'engagement', 'graduation', 'gala_dinner', 'corporate_seminar'
);

CREATE TYPE time_slot AS ENUM ('pagi', 'siang', 'malam');

CREATE TYPE schedule_status AS ENUM ('available', 'held', 'booked', 'blocked');

CREATE TYPE booking_payment_status AS ENUM (
  'pending', 'dp_paid', 'fully_paid', 'cancelled', 'expired'
);

CREATE TYPE payment_type AS ENUM ('down_payment', 'settlement');

CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');


-- ------------------------------------------------------------
-- USERS
-- Akun login untuk customer maupun pemilik vendor (role membedakan)
-- ------------------------------------------------------------
CREATE TABLE users (
  user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(20) NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'customer',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- VENDORS
-- Profil bisnis vendor, dimiliki oleh satu akun user (role vendor_owner)
-- ------------------------------------------------------------
CREATE TABLE vendors (
  vendor_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  business_name         VARCHAR(150) NOT NULL,
  category              vendor_category NOT NULL,
  city                  jabodetabek_city NOT NULL,
  address               TEXT,
  description           TEXT,
  minimum_notice_days   INT NOT NULL DEFAULT 7 CHECK (minimum_notice_days >= 0),
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  rating_avg            NUMERIC(2,1) NOT NULL DEFAULT 0.0 CHECK (rating_avg BETWEEN 0 AND 5),
  rating_count          INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_city_category ON vendors (city, category);

-- ------------------------------------------------------------
-- SERVICES
-- Katalog jasa/paket yang dijual tiap vendor
-- ------------------------------------------------------------
CREATE TABLE services (
  service_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id      UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  service_name   VARCHAR(150) NOT NULL,
  description    TEXT,
  price          NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  is_formal_only BOOLEAN NOT NULL DEFAULT TRUE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_vendor ON services (vendor_id);

-- ------------------------------------------------------------
-- PORTFOLIO_IMAGES
-- Galeri foto vendor (dipisah dari kolom array biar rapi & scalable)
-- ------------------------------------------------------------
CREATE TABLE portfolio_images (
  image_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     VARCHAR(200),
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_vendor ON portfolio_images (vendor_id);

-- ------------------------------------------------------------
-- VENDOR_SCHEDULES
-- Slot ketersediaan vendor per tanggal + shift waktu.
-- UNIQUE constraint di sini adalah jaring pengaman terakhir di level DB
-- untuk mencegah double-booking, selain Redis lock di layer aplikasi.
-- ------------------------------------------------------------
CREATE TABLE vendor_schedules (
  schedule_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  event_date   DATE NOT NULL,
  time_slot    time_slot NOT NULL,
  status       schedule_status NOT NULL DEFAULT 'available',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, event_date, time_slot)
);

CREATE INDEX idx_schedules_search ON vendor_schedules (event_date, time_slot, status);

-- ------------------------------------------------------------
-- BOOKINGS
-- Satu booking = satu service + satu slot jadwal yang dikunci.
-- soft_lock_expires_at dipakai untuk aturan soft-booking 1x24 jam.
-- ------------------------------------------------------------
CREATE TABLE bookings (
  booking_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  service_id            UUID NOT NULL REFERENCES services(service_id) ON DELETE RESTRICT,
  schedule_id           UUID NOT NULL UNIQUE REFERENCES vendor_schedules(schedule_id) ON DELETE RESTRICT,
  event_type            event_type NOT NULL,
  event_location_detail TEXT NOT NULL,
  total_price           NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  dp_amount             NUMERIC(12,2) NOT NULL CHECK (dp_amount >= 0),
  payment_status        booking_payment_status NOT NULL DEFAULT 'pending',
  soft_lock_expires_at  TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_status_lock ON bookings (payment_status, soft_lock_expires_at);

-- ------------------------------------------------------------
-- PAYMENTS
-- Tiap booking bisa punya >1 transaksi (DP, lalu pelunasan),
-- masing-masing dengan referensi transaksi dari payment gateway sendiri.
-- ------------------------------------------------------------
CREATE TABLE payments (
  payment_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id             UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  payment_type           payment_type NOT NULL,
  amount                 NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  gateway_transaction_id VARCHAR(150),
  gateway_status         payment_status NOT NULL DEFAULT 'pending',
  paid_at                TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments (booking_id);

-- ------------------------------------------------------------
-- REVIEWS
-- Ulasan hanya bisa dibuat setelah booking selesai (1 booking = 1 review)
-- ------------------------------------------------------------
CREATE TABLE reviews (
  review_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  vendor_id   UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_vendor ON reviews (vendor_id);
