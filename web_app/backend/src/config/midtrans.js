const crypto = require('crypto');
const midtransClient = require('midtrans-client');

// Pola sama seperti redis.js: Midtrans sengaja OPSIONAL. Kalau MIDTRANS_SERVER_KEY
// kosong, aplikasi tetap jalan dalam mode simulasi — nomor VA dibuat lokal dan
// pembayaran ditandai lunas lewat POST /payments/:id/simulate.
//
// Alasannya praktis: webhook Midtrans butuh backend yang bisa dihubungi dari
// internet. Kalau pas demo tunnel-nya mati atau internet rewel, alur pemesanan
// harus tetap bisa ditunjukkan dari ujung ke ujung.
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

const enabled = Boolean(SERVER_KEY);

const core = enabled
  ? new midtransClient.CoreApi({
      isProduction: IS_PRODUCTION,
      serverKey: SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    })
  : null;

if (enabled) {
  console.log(`[midtrans] aktif (${IS_PRODUCTION ? 'PRODUCTION' : 'sandbox'})`);
} else {
  console.warn('[midtrans] MIDTRANS_SERVER_KEY kosong — mode simulasi, tidak ada transaksi nyata');
}

// Ambil URL dari array `actions` yang dikirim Midtrans untuk QRIS/GoPay.
const action = (res, name) => {
  const found = (res.actions || []).find((a) => a.name === name);
  return found ? found.url : null;
};

// Semua metode pembayaran yang didukung, dalam satu tabel.
//
//   build(amount) -> potongan request yang khas metode ini
//   extract(res)  -> apa yang harus disimpan & ditampilkan ke user
//
// Ditaruh sebagai tabel, bukan rentetan if, karena 10 metode cuma beda dua
// baris itu saja. Kartu kredit SENGAJA tidak ada: dia butuh SDK tokenisasi di
// browser dan alur 3DS, jadi bukan sekadar satu entri di sini. Paylater
// (Akulaku/Kredivo) sudah diuji jalan tapi dikeluarkan atas permintaan user.
const METHODS = {
  // --- Virtual Account: payment_type 'bank_transfer' ---------------------
  bca_va: {
    label: 'BCA Virtual Account',
    build: () => ({ payment_type: 'bank_transfer', bank_transfer: { bank: 'bca' } }),
    extract: (r) => ({ bank: 'bca', va_number: (r.va_numbers || [])[0]?.va_number || null }),
  },
  bni_va: {
    label: 'BNI Virtual Account',
    build: () => ({ payment_type: 'bank_transfer', bank_transfer: { bank: 'bni' } }),
    extract: (r) => ({ bank: 'bni', va_number: (r.va_numbers || [])[0]?.va_number || null }),
  },
  bri_va: {
    label: 'BRI Virtual Account',
    build: () => ({ payment_type: 'bank_transfer', bank_transfer: { bank: 'bri' } }),
    extract: (r) => ({ bank: 'bri', va_number: (r.va_numbers || [])[0]?.va_number || null }),
  },
  cimb_va: {
    label: 'CIMB Virtual Account',
    build: () => ({ payment_type: 'bank_transfer', bank_transfer: { bank: 'cimb' } }),
    extract: (r) => ({ bank: 'cimb', va_number: (r.va_numbers || [])[0]?.va_number || null }),
  },
  // Permata menaruh nomornya di field sendiri, bukan di array va_numbers.
  permata_va: {
    label: 'Permata Virtual Account',
    build: () => ({ payment_type: 'bank_transfer', bank_transfer: { bank: 'permata' } }),
    extract: (r) => ({ bank: 'permata', va_number: r.permata_va_number || null }),
  },
  // Mandiri bukan 'bank_transfer' dan TIDAK punya nomor VA — yang keluar
  // bill_key + biller_code. Baru bisa ditampung setelah kolom details JSONB.
  mandiri_bill: {
    label: 'Mandiri Bill Payment',
    build: () => ({
      payment_type: 'echannel',
      echannel: { bill_info1: 'Pembayaran', bill_info2: 'Festa Festum' },
    }),
    extract: (r) => ({ bill_key: r.bill_key || null, biller_code: r.biller_code || null }),
  },

  // --- E-money: QR ditampilkan dari URL, tanpa SDK frontend --------------
  qris: {
    label: 'QRIS',
    build: () => ({ payment_type: 'qris' }),
    extract: (r) => ({ qr_url: action(r, 'generate-qr-code') }),
  },
  // Dibayar lewat QRIS, notifikasinya datang sebagai payment_type 'qris'.
  gopay: {
    label: 'GoPay',
    build: () => ({ payment_type: 'gopay' }),
    extract: (r) => ({
      qr_url: action(r, 'generate-qr-code'),
      deeplink: action(r, 'deeplink-redirect'),
    }),
  },

  // --- Gerai: payment_type 'cstore', user bawa kode ke kasir -------------
  indomaret: {
    label: 'Indomaret',
    build: () => ({
      payment_type: 'cstore',
      cstore: { store: 'indomaret', message: 'Festa Festum' },
    }),
    extract: (r) => ({ payment_code: r.payment_code || null, store: 'indomaret' }),
  },
  alfamart: {
    label: 'Alfamart',
    build: () => ({
      payment_type: 'cstore',
      cstore: { store: 'alfamart', message: 'Festa Festum' },
    }),
    extract: (r) => ({ payment_code: r.payment_code || null, store: 'alfamart' }),
  },

};

const METHOD_IDS = Object.keys(METHODS);

// Midtrans menandatangani notifikasi dengan SHA512 dari empat nilai yang
// digabung, BUKAN dari raw body. Jadi webhook-nya aman diparse express.json().
//
// Verifikasi ini WAJIB: tanpa ini siapa pun yang tahu URL webhook bisa
// menandai booking orang lain sebagai lunas.
function verifySignature({ order_id, status_code, gross_amount, signature_key }) {
  if (!enabled) return false;
  const expected = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${SERVER_KEY}`)
    .digest('hex');
  // timingSafeEqual menolak panjang beda, jadi cek dulu.
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature_key || ''), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Terjemahan status Midtrans -> enum payment_status milik kita.
// 'capture' hanya dihitung lunas kalau fraud_status-nya 'accept'.
function mapStatus(transactionStatus, fraudStatus) {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'accept' ? 'success' : 'failed';
  }
  if (transactionStatus === 'settlement') return 'success';
  if (transactionStatus === 'pending') return 'pending';
  if (['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus)) return 'failed';
  if (['refund', 'partial_refund'].includes(transactionStatus)) return 'refunded';
  return 'pending';
}

module.exports = { core, enabled, verifySignature, mapStatus, METHODS, METHOD_IDS };
