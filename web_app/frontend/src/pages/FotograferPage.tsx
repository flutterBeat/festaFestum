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
    options: ['Semua Harga', '< Rp 1.500.000', 'Rp 1.500.000 - Rp 2.000.000', '> Rp 2.000.000'],
  },
  {
    kind: 'select',
    label: 'Jenis Acara',
    options: ['Semua Acara', 'Pernikahan', 'Wisuda', 'Korporat', 'Prewedding'],
  },
]

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors?category=fotografer
// begitu halaman ini disambungkan ke backend.
const vendors: Vendor[] = [
  { id: 'eternal-moments', name: 'Eternal Moments Studio', city: 'Jakarta Selatan', rating: 4.8, ratingCount: 130, priceFrom: 1600000, image: '/img/foto-eternal.jpg' },
  { id: 'karya-lens', name: 'Karya Lens Studio', city: 'Jakarta Selatan', rating: 4.6, ratingCount: 130, priceFrom: 1700000, image: '/img/foto-karya.jpg' },
  { id: 'narasi-visual', name: 'Narasi Visual Studio', city: 'Jakarta Selatan', rating: 4.5, ratingCount: 130, priceFrom: 1600000, image: '/img/foto-narasi.jpg' },
  { id: 'snapshot-elegant', name: 'Snapshot Elegant Studio', city: 'Jakarta Selatan', rating: 4.5, ratingCount: 130, priceFrom: 1000000, image: '/img/foto-snapshot.jpg' },
  { id: 'quality-foto', name: 'Quality Foto Studio', city: 'Jakarta Selatan', rating: 4.8, ratingCount: 130, priceFrom: 2200000, image: '/img/foto-quality.jpg' },
  { id: 'timeless-photo', name: 'Timeless Photo Studio', city: 'Jakarta Selatan', rating: 4.8, ratingCount: 130, priceFrom: 1800000, image: '/img/foto-timeless.jpg' },
]

export default function FotograferPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="h-[340px] overflow-hidden md:h-[500px]">
          <Img
            src="/img/hero-fotografer.jpg"
            alt="Kamera profesional"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto -mt-2 max-w-[1330px] px-6 md:px-12">
          <SearchPanel fields={searchFields} />
        </div>
      </section>

      {/* GRID VENDOR */}
      <section className="mx-auto max-w-[1330px] px-6 pt-10 md:px-12">
        <h2 className="font-display text-[32px] font-semibold">Pilihan Fotografer</h2>

        <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} to={`/fotografer/${v.id}`} />
          ))}
        </div>
      </section>

      <div className="pt-20">
        <AiBanner
          subtitle="Belum Tahu Fotografer yang Cocok?"
          body="Temukan rekomendasi fotografer berdasarkan jenis acara, gaya dokumentasi, lokasi, dan budget Anda."
          cta="Cari Rekomendasi"
        />
      </div>
    </>
  )
}
