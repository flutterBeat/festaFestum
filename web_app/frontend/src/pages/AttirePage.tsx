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
    options: ['Semua Harga', '< Rp 1.000.000', 'Rp 1.000.000 - Rp 2.000.000', '> Rp 2.000.000'],
  },
  {
    kind: 'select',
    label: 'Semua Busana',
    options: ['Semua Busana', 'Jas', 'Kebaya', 'Gaun', 'Beskap'],
  },
]

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors?category=attire
// begitu halaman ini disambungkan ke backend.
const vendors: Vendor[] = [
  { id: 'elegant-suit', name: 'Elegant Suit House', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 700000, image: '/img/attire-elegant.jpg' },
  { id: 'javanesse', name: 'Javanesse Attire', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 1200000, image: '/img/attire-javanesse.jpg' },
  { id: 'otentik', name: 'Otentik Fashion', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 700000, image: '/img/attire-otentik.jpg' },
  { id: 'luxe', name: 'Luxe Fashion House', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 1800000, image: '/img/attire-luxe.jpg' },
  { id: 'tenun-indah', name: 'Tenun Indah Attire', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 1000000, image: '/img/attire-tenun.jpg' },
  { id: 'xtravaganza', name: 'Xtravaganza Attire', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 2500000, image: '/img/attire-xtravaganza.jpg' },
]

export default function AttirePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="h-[340px] overflow-hidden md:h-[500px]">
          <Img
            src="/img/hero-attire.jpg"
            alt="Busana formal tradisional"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto -mt-2 max-w-[1330px] px-6 md:px-12">
          <SearchPanel fields={searchFields} />
        </div>
      </section>

      {/* GRID VENDOR */}
      <section className="mx-auto max-w-[1330px] px-6 pt-10 md:px-12">
        <h2 className="font-display text-[32px] font-semibold">Pilihan Jas/Kebaya</h2>

        <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} to={`/jas-kebaya/${v.id}`} />
          ))}
        </div>
      </section>

      <div className="pt-20">
        <AiBanner
          subtitle="Belum Menemukan Outfit yang Tepat?"
          body="Biarkan AI membantu merekomendasikan jas atau kebaya berdasarkan jenis acara, preferensi warna, ukuran, dan gaya yang Anda inginkan."
          cta="Cari Rekomendasi"
        />
      </div>
    </>
  )
}
