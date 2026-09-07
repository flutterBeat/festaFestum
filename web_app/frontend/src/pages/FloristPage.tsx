import Img from '../components/Img'
import SearchPanel, { type Field } from '../components/SearchPanel'
import VendorCard, { type Vendor } from '../components/VendorCard'
import AiBanner from '../components/AiBanner'

const searchFields: Field[] = [
  {
    kind: 'select',
    label: 'Lokasi (JABODETABEK)',
    options: ['JABODETABEK', 'Jakarta Selatan', 'Jakarta Pusat', 'Depok', 'Bogor', 'Bekasi'],
  },
  {
    kind: 'select',
    label: 'Harga Mulai',
    options: ['Semua Harga', '< Rp 500.000', 'Rp 500.000 - Rp 1.000.000', '> Rp 1.000.000'],
  },
  {
    kind: 'select',
    label: 'Semua Jenis',
    options: ['Semua Jenis', 'Buket Pengantin', 'Dekorasi Pelaminan', 'Meja Tamu', 'Hand Bouquet'],
  },
]

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors?category=florist
// begitu halaman ini disambungkan ke backend.
const vendors: Vendor[] = [
  { id: '1', name: 'Peony Studio Florist', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 500000, image: '/img/florist-peony.jpg' },
  { id: '2', name: 'Bloom & Co', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 750000, image: '/img/florist-bloom.jpg' },
  { id: '3', name: 'Botanica Florist', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 800000, image: '/img/florist-botanica.jpg' },
  { id: '4', name: 'Rose Garden Studio', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 450000, image: '/img/florist-rose.jpg' },
  { id: '5', name: 'Galdenia Florist', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 300000, image: '/img/florist-galdenia.jpg' },
  { id: '6', name: 'Kenangan Florist', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 350000, image: '/img/florist-kenangan.jpg' },
]

export default function FloristPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="h-[340px] overflow-hidden md:h-[500px]">
          <Img
            src="/img/hero-florist.jpg"
            alt="Rangkaian bunga mawar"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Panel duduk di batas bawah foto, menindih tipis saja. */}
        <div className="relative z-10 mx-auto -mt-2 max-w-[1330px] px-6 md:px-12">
          <SearchPanel fields={searchFields} />
        </div>
      </section>

      {/* GRID VENDOR */}
      <section className="mx-auto max-w-[1330px] px-6 pt-10 md:px-12">
        <h2 className="font-display text-[32px] font-semibold">Semua Pilihan</h2>

        <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      </section>

      <div className="pt-20">
        <AiBanner
          subtitle="Bingung Memilih Rangkaian Bunga?"
          body="Dapatkan rekomendasi florist dan rangkaian bunga yang sesuai dengan jenis acara, tema, warna, dan budget Anda."
          cta="Cari Rekomendasi"
        />
      </div>
    </>
  )
}
