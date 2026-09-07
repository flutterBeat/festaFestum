/** Ringkasan pesanan contoh untuk halaman "Lengkapi Detail Pesanan".
 *
 *  Di mockup kelima halaman menampilkan vendor yang sama (Botanica Florist)
 *  karena panel kanannya di-copy antar frame. Di sini sengaja dibedakan per
 *  kategori — vendornya cocok dengan halaman detail masing-masing dan
 *  harganya beda-beda, jadi kalau salah halaman yang dirender langsung
 *  kelihatan tanpa harus buka DevTools.
 *
 *  Diganti hasil GET /api/v1/vendors/:id + paket yang dipilih user begitu
 *  alur booking disambungkan ke backend.
 */

export type OrderSummary = {
  vendor: string
  packageName: string
  image: string
  imageAlt: string
  price: number
  backTo: string
}

/** Mockup menulis "Deposit(5%)" tapi angkanya 45.000 dari 300.000 = 15%.
 *  Dipakai 15% supaya cocok dengan total di mockup; ubah di sini kalau
 *  DP yang benar memang 5%. */
export const DEPOSIT_RATE = 0.15

export const deposit = (price: number) => Math.round(price * DEPOSIT_RATE)

/** Pesanan yang dibawa alur checkout → Virtual Account → konfirmasi.
 *  Satu objek dipakai bertiga supaya angka & nama vendornya konsisten
 *  waktu ditelusuri dari halaman ke halaman. */
export const checkout = {
  orderId: 'FF-1234',
  vendor: 'Galdenia Florist',
  category: 'FLORIST',
  packageName: 'Paket buket bunga',
  packageLong: 'Bucket Bunga Premium',
  image: '/img/florist-galdenia.jpg',
  imageAlt: 'Buket bunga pastel',
  price: 300000,
  eventDate: '15 November 2026',
  eventDateShort: '15 Nov 2026',
  venue: 'Universitas Gunadarma Kampus D',
  bank: 'BCA',
  vaNumber: '8077 1234 5678 9012',
}

export const orders: Record<string, OrderSummary> = {
  florist: {
    vendor: 'Botanica Florist',
    packageName: 'Paket Premium: Bucket Bunga',
    image: '/img/botanica-2.jpg',
    imageAlt: 'Buket mawar putih',
    price: 300000,
    backTo: '/florist/botanica',
  },
  mua: {
    vendor: 'Aura Glow Artisty',
    packageName: 'Paket: Graduation Basic',
    image: '/img/aura-1.jpg',
    imageAlt: 'Riasan pengantin natural',
    price: 400000,
    backTo: '/mua/aura-glow',
  },
  fotografer: {
    vendor: 'Eternal Moments Studio',
    packageName: 'Paket: Esensial 8 Jam',
    image: '/img/eternal-1.jpg',
    imageAlt: 'Dokumentasi resepsi malam',
    price: 15000000,
    backTo: '/fotografer/eternal-moments',
  },
  eo: {
    vendor: 'Nusantara Grand EO',
    packageName: 'Paket Essential',
    image: '/img/eo-gala-1.jpg',
    imageAlt: 'Gala dinner korporat',
    price: 7500000,
    backTo: '/event-organizer/nusantara-grand',
  },
  attire: {
    vendor: 'Javanesse Attire',
    packageName: 'Sewa Jas — 3 hari',
    image: '/img/javanesse-1.jpg',
    imageAlt: 'Jas hitam di butik',
    price: 1200000,
    backTo: '/jas-kebaya/javanesse',
  },
}
