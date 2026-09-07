import { useState } from 'react'
import { Link } from 'react-router-dom'
import Img from '../components/Img'
import VendorLocation from '../components/VendorLocation'
import BackButton from '../components/BackButton'
import { ArrowRight, ChevronDown, PhotoIcon } from '../components/icons'
import { shifts } from '../data/shifts'
import { rupiah } from '../lib/format'

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors/:id begitu
// halaman ini disambungkan ke backend.
const v = {
  name: 'Aura Glow Artisty',
  badge: 'MakeUp Artist',
  headline: 'The Art Of Beauty',
  about:
    'Spesialis dalam riasan pengantin modern dan flawless yang menonjolkan kecantikan alami Anda. Dengan pengalaman lebih dari 8 tahun di industri pernikahan premium, tim Aura Glow didedikasikan untuk memastikan Anda tampil memukau dan merasa percaya diri di hari istimewa. Kami hanya menggunakan produk kosmetik high-end untuk ketahanan sepanjang hari.',
  photos: [
    { src: '/img/aura-1.jpg', alt: 'Riasan pengantin natural' },
    { src: '/img/aura-2.jpg', alt: 'Peralatan makeup profesional' },
  ],
  packages: [
    {
      name: 'Graduation Glam',
      priceFrom: 450000,
      desc: 'Paket makeup dan styling khusus untuk wisuda agar tampil fresh, elegan, dan tetap percaya diri saat sesi acara maupun foto.',
      bullets: [
        'Makeup sesuai karakter dan kebutuhan wajah',
        'Hair do atau hijab styling',
        'Tampilan tahan lama untuk acara wisuda',
      ],
    },
    { name: 'Graduation Basic', priceFrom: 400000, desc: '', bullets: [] },
    { name: 'Graduation Premium', priceFrom: 475000, desc: '', bullets: [] },
  ],
}

export default function MuaDetailPage() {
  const [packageName, setPackageName] = useState(v.packages[1].name)

  // Total = harga paket yang dipilih. Fallback ke paket pertama supaya panel
  // tidak pernah menampilkan total kosong.
  const selected = v.packages.find((p) => p.name === packageName) ?? v.packages[0]

  return (
    <div className="mx-auto max-w-[1330px] px-6 pt-12 pb-20 md:px-12">
      <BackButton fallback="/mua" />

      <h1 className="mt-5 font-display text-[38px] font-semibold">{v.name}</h1>
      <span className="mt-3 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-[13px] text-maroon">
        {v.badge}
      </span>

      {/* GALERI: dua foto, besar di kiri. */}
      <section className="relative mt-6 grid gap-2.5 md:grid-cols-3">
        <Img
          src={v.photos[0].src}
          alt={v.photos[0].alt}
          className="h-[300px] w-full object-cover md:col-span-2 md:h-[520px]"
        />
        <Img src={v.photos[1].src} alt={v.photos[1].alt} className="h-[300px] w-full object-cover md:h-[520px]" />

        <button
          type="button"
          className="absolute right-4 bottom-4 flex items-center gap-2 rounded-sm bg-white/90 px-3 py-1.5 text-[12px] shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <PhotoIcon />
          Lihat Semua Foto
        </button>
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="font-display text-[26px] font-semibold">{v.headline}</h2>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.85] text-ink/85">{v.about}</p>

          <h2 className="mt-12 border-t border-line pt-12 font-display text-[26px] font-semibold">
            Paket Layanan
          </h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            {v.packages.map((p) => (
              <article key={p.name} className="flex flex-col border border-line bg-white p-5">
                <h3 className="font-display text-[22px] font-semibold">{p.name}</h3>
                {p.desc && <p className="mt-3 text-[12px] leading-relaxed text-ink/75">{p.desc}</p>}
                {p.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-ink/75">
                    {p.bullets.map((b) => (
                      <li key={b}>✓ {b}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto border-t border-line pt-3">
                  <p className="mt-4 text-[11px] text-muted">Mulai dari</p>
                  <p className="font-display text-[21px] font-semibold">{rupiah(p.priceFrom)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* PANEL PEMESANAN */}
        <aside className="h-fit border border-line bg-white p-5 lg:sticky lg:top-[90px]">
          <p className="rounded-sm bg-navy-900 py-3.5 text-center text-[15px] font-semibold text-white">
            Atur Jadwal
          </p>

          <label htmlFor="paket" className="mt-5 block text-[14px] text-muted">
            Jenis Paket
          </label>
          <div className="relative mt-2">
            <select
              id="paket"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="h-11 w-full appearance-none rounded-sm border border-line bg-white px-3 pr-9 text-[14px] outline-none focus:border-navy-900"
            >
              {v.packages.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
          </div>

          <label htmlFor="event-date" className="mt-5 block text-[15px] font-semibold">
            Tanggal Acara
          </label>
          <input
            id="event-date"
            type="date"
            defaultValue="2026-01-15"
            className="mt-2 w-full border-b border-line bg-transparent pb-1.5 text-[15px] outline-none"
          />

          <p className="mt-5 text-[15px] font-semibold">Shift Layanan</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            {shifts.map((s) => (
              <label
                key={s.value}
                className="cursor-pointer border border-line py-2.5 text-center text-[13px] has-checked:border-navy-900 has-checked:bg-lavender/40"
              >
                <input type="radio" name="shift" value={s.value} className="sr-only" />
                {s.label}
              </label>
            ))}
          </div>

          <div className="mt-7 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[15px] font-semibold">Total:</span>
            <span className="font-display text-[22px] font-semibold">{rupiah(selected.priceFrom)}</span>
          </div>

          {/* Paket, tanggal & shift belum ikut terbawa — nanti lewat POST /schedules/hold. */}
          <Link
            to="pesan"
            className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-sm bg-amber text-[15px] font-semibold text-navy-900 transition-opacity hover:opacity-90"
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
