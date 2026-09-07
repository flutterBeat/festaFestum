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
    label: 'Style',
    options: ['Semua Style', 'Natural / Flawless', 'Glam', 'Korean Look', 'Traditional'],
  },
]

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors?category=mua
// begitu halaman ini disambungkan ke backend.
const vendors: Vendor[] = [
  { id: 'aura-glow', name: 'Aura Glow Artisty', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 450000, image: '/img/mua-aura.jpg' },
  { id: 'velvet-rose', name: 'Velvet Rose MUA', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 700000, image: '/img/mua-velvet.jpg' },
  { id: 'whimsy', name: 'Whimsy Beauty Artist', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 550000, image: '/img/mua-whimsy.jpg' },
  { id: 'hera', name: 'Hera Beauty Studio', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 550000, image: '/img/mua-hera.jpg' },
  { id: 'iconic', name: 'Iconic Beauty Artist', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 850000, image: '/img/mua-iconic.jpg' },
  { id: 'fancy', name: 'Fancy Beauty Studio', city: 'Jakarta Selatan', rating: 4.5, ratingCount: 99, priceFrom: 600000, image: '/img/mua-fancy.jpg' },
]

export default function MuaPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="h-[340px] overflow-hidden md:h-[500px]">
          <Img
            src="/img/hero-mua.jpg"
            alt="Kuas makeup profesional"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto -mt-2 max-w-[1330px] px-6 md:px-12">
          <SearchPanel fields={searchFields} />
        </div>
      </section>

      {/* GRID VENDOR */}
      <section className="mx-auto max-w-[1330px] px-6 pt-10 md:px-12">
        <h2 className="font-display text-[32px] font-semibold">Pilihan MUA</h2>

        <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} to={`/mua/${v.id}`} />
          ))}
        </div>
      </section>

      <div className="pt-20">
        <AiBanner
          subtitle="Belum Tahu Style Makeup yang Cocok?"
          body="Biarkan AI membantu menemukan rekomendasi MUA dan style makeup berdasarkan acara, preferensi, dan budget Anda."
          cta="Mulai Menyusun"
        />
      </div>
    </>
  )
}
