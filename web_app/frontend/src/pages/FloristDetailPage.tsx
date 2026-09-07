import { Link } from 'react-router-dom'
import Img from '../components/Img'
import VendorLocation from '../components/VendorLocation'
import BackButton from '../components/BackButton'
import { ArrowRight, CalendarIcon, serviceIcons } from '../components/icons'
import { shifts } from '../data/shifts'
import { rupiah } from '../lib/format'

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors/:id begitu
// halaman ini disambungkan ke backend.
const v = {
  name: 'Botanica Florist',
  badge: 'Premium Florist',
  headline: 'The Art Of Floristry',
  about:
    'Botanica Florist menghadirkan keanggunan botani ke dalam setiap momen berharga Anda. Dengan dedikasi pada seni merangkai bunga, kami menciptakan instalasi floral yang menceritakan kisah cinta, kesuksesan, dan perayaan melalui palet warna yang romantis dan desain struktural yang memukau.',
  priceFrom: 2500000,
  priceUnit: 'paket',
  photos: [
    { src: '/img/botanica-1.jpg', alt: 'Instalasi meja jamuan' },
    { src: '/img/botanica-2.jpg', alt: 'Bridal bouquet' },
    { src: '/img/botanica-3.jpg', alt: 'Arch bunga di taman' },
    { src: '/img/botanica-4.jpg', alt: 'Rangkaian meja resepsi' },
    { src: '/img/botanica-5.jpg', alt: 'Mawar merah muda' },
  ],
  services: [
    { icon: 'sparkle', title: 'Instalasi Panggung', desc: 'Dekorasi pelaminan atau panggung utama yang megah dan dramatis.' },
    { icon: 'table', title: 'Table Setting', desc: 'Rangkaian bunga meja yang intim dan elegan untuk resepsi jamuan makan.' },
    { icon: 'heart', title: 'Bridal Bouquet', desc: 'Buket tangan khusus untuk pengantin dengan desain personal dan romantis.' },
    { icon: 'flower', title: 'Dekorasi Ruangan', desc: 'Penataan bunga secara menyeluruh untuk mengubah suasana ruangan (arch, aisle).' },
  ],
}

export default function FloristDetailPage() {
  return (
    <div className="mx-auto max-w-[1330px] px-6 pt-12 pb-20 md:px-12">
      <BackButton fallback="/florist" />

      <h1 className="mt-5 font-display text-[38px] font-semibold">{v.name}</h1>
      <span className="mt-3 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-[13px] text-maroon">
        {v.badge}
      </span>

      {/* GALERI: satu foto besar + empat kecil, seperti mockup. */}
      <section className="mt-6">
        <p className="mb-2 text-[11px] text-muted">
          <Link to="/florist" className="hover:underline">
            Florist
          </Link>{' '}
          &gt; {v.name}
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <Img
            src={v.photos[0].src}
            alt={v.photos[0].alt}
            className="h-[260px] w-full object-cover sm:col-span-2 lg:h-[520px]"
          />
          {v.photos.slice(1).map((p) => (
            <Img key={p.src} src={p.src} alt={p.alt} className="h-[180px] w-full object-cover lg:h-[255px]" />
          ))}
        </div>
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="font-display text-[26px] font-semibold">{v.headline}</h2>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.85] text-ink/85">{v.about}</p>

          <h2 className="mt-12 border-t border-line pt-12 font-display text-[26px] font-semibold">
            Layanan Tersedia
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {v.services.map((s) => {
              const Icon = serviceIcons[s.icon as keyof typeof serviceIcons]
              return (
                <div key={s.title} className="flex gap-3 border border-line bg-white p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-maroon">
                    <Icon />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold">{s.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink/75">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PANEL PEMESANAN */}
        <aside className="h-fit border border-line bg-white p-5 lg:sticky lg:top-[90px]">
          <p className="rounded-sm bg-navy-900 py-3.5 text-center text-[15px] font-semibold text-white">
            Detail Informasi
          </p>

          <p className="mt-5 text-[14px] text-muted">Mulai dari</p>
          <p className="font-display text-[27px] font-semibold">
            {rupiah(v.priceFrom)}/{v.priceUnit}
          </p>

          <label htmlFor="event-date" className="mt-5 block text-[15px] font-semibold">
            Tanggal Acara
          </label>
          <div className="relative mt-2 border-b border-line pb-1.5">
            <input
              id="event-date"
              type="date"
              defaultValue="2026-01-15"
              className="w-full bg-transparent pr-7 text-[15px] outline-none"
            />
            <CalendarIcon className="pointer-events-none absolute right-1 top-1 h-4 w-4 text-muted" />
          </div>

          <p className="mt-5 text-[15px] font-semibold">Shift Layanan</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            {shifts.map((s) => (
              <label
                key={s.value}
                className="cursor-pointer border border-line py-2.5 text-center text-[13px] has-checked:border-navy-900 has-checked:bg-lavender/40"
              >
                <input type="radio" name="shift" value={s.value} className="sr-only" />
                <span className="block font-medium">{s.label}</span>
                <span className="block text-muted">{s.hours}</span>
              </label>
            ))}
          </div>

          {/* Tanggal & shift belum ikut terbawa — nanti lewat POST /schedules/hold. */}
          <Link
            to="pesan"
            className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-sm bg-amber text-[15px] font-semibold text-navy-900 transition-opacity hover:opacity-90"
          >
            Ajukan Pesanan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>

      <div className="mt-16">
        <VendorLocation />
      </div>
    </div>
  )
}
