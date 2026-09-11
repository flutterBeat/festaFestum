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

// Bank yang didukung lewat Bank Transfer / VA di sandbox.
const SUPPORTED_BANKS = ['bca', 'bni', 'bri', 'permata', 'cimb'];

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

module.exports = { core, enabled, verifySignature, mapStatus, SUPPORTED_BANKS };
