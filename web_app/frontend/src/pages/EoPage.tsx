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
    label: 'Semua Layanan',
    options: ['Semua Layanan', 'Pernikahan', 'Gala Dinner', 'Konferensi', 'Wisuda'],
  },
  {
    kind: 'select',
    label: 'Harga Mulai',
    options: ['Semua Harga', '< Rp 5.000.000', 'Rp 5.000.000 - Rp 10.000.000', '> Rp 10.000.000'],
  },
]

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors?category=event_organizer
// begitu halaman ini disambungkan ke backend.
const vendors: Vendor[] = [
  { id: 'nusantara-grand', name: 'Nusantara Grand EO', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 2500000, image: '/img/eo-nusantara.jpg' },
  { id: 'quantum', name: 'Quantum Event House', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 2500000, image: '/img/eo-quantum.jpg' },
  { id: 'brilliance', name: 'Brilliance Organizer', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 2500000, image: '/img/eo-brilliance.jpg' },
  { id: 'xclusive', name: 'Xclusive Event House', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 2500000, image: '/img/eo-xclusive.jpg' },
  { id: 'festive-glory', name: 'Festive Glory Planner', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 2500000, image: '/img/eo-festive.jpg' },
  { id: 'lestari', name: 'Lestari Event Group', city: 'Jakarta Selatan', rating: 4.9, ratingCount: 130, priceFrom: 2500000, image: '/img/eo-lestari.jpg' },
]

export default function EoPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="h-[340px] overflow-hidden md:h-[500px]">
          <Img
            src="/img/hero-eo.jpg"
            alt="Persiapan acara korporat di ballroom"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto -mt-2 max-w-[1330px] px-6 md:px-12">
          <SearchPanel fields={searchFields} />
        </div>
      </section>

      {/* GRID VENDOR */}
      <section className="mx-auto max-w-[1330px] px-6 pt-10 md:px-12">
        <h2 className="font-display text-[32px] font-semibold">Pilihan Event Organizer</h2>

        <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} to={`/event-organizer/${v.id}`} />
          ))}
        </div>
      </section>

      <div className="pt-20">
        <AiBanner
          subtitle="Butuh Bantuan Merencanakan Acara?"
          body="Ceritakan kebutuhan acara dan budget Anda, lalu dapatkan rekomendasi layanan dan Event Organizer yang sesuai."
          cta="Mulai Rencanakan"
        />
      </div>
    </>
  )
}
