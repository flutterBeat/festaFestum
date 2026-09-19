// Kategori yang mengunci SHIFT: satu pesanan menutup shift itu, dan
// kapasitas hariannya dipotong per PESANAN, bukan per unit.
//
// MUA, EO, dan fotografer adalah tim yang hadir di acaranya. MUA yang merias
// 5 orang tetap memakai satu tim, jadi pesanan berisi 5 orang memotong 1 dari
// kapasitas — bukan 5. Florist dan sewa jas/kebaya kebalikannya: yang habis
// stok barang, jadi 5 buket memang memotong 5, dan beberapa pesanan boleh
// berbagi shift yang sama.
//
// Berapa banyak yang muat dalam sehari BUKAN lagi urusan file ini — itu
// vendors.daily_capacity, diisi vendornya sendiri. Dulu di sini ada
// EKSKLUSIF_HARIAN yang memaksa "satu tanggal penuh"; ternyata itu cuma
// kapasitas = 1, jadi lima kategori tidak butuh dua cabang logika.
const KUNCI_SHIFT = ['event_organizer', 'makeup_artist', 'photographer'];

const kunciShift = (category) => KUNCI_SHIFT.includes(category);

// Pesanan dianggap MASIH MEMAKAI kapasitas selama belum batal/kedaluwarsa.
// Penolakan vendor dan pembatalan customer dua-duanya ikut menulis
// payment_status = 'cancelled', jadi satu predikat ini sudah mencakup
// ditolak/dibatalkan/kedaluwarsa sekaligus — sama persis dengan cakupan
// idx_booking_shift_aktif di migrasi 013.
const BOOKING_AKTIF = `payment_status NOT IN ('cancelled', 'expired')`;

module.exports = { KUNCI_SHIFT, kunciShift, BOOKING_AKTIF };
