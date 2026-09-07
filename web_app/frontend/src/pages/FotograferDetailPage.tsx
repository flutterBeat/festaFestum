import { useState } from 'react'
import { Link } from 'react-router-dom'
import Img from '../components/Img'
import BackButton from '../components/BackButton'
import { ArrowRight, CalendarIcon, CheckCircleIcon, ChevronDown } from '../components/icons'
import { shifts } from '../data/shifts'
import { rupiah } from '../lib/format'

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors/:id begitu
// halaman ini disambungkan ke backend.
const v = {
  name: 'Eternal Moments Studio',
  badge: 'Fotografer',
  about:
    'Menangkap momen tak terlupakan dengan sentuhan sinematik dan elegan. Spesialisasi dalam dokumentasi Wisuda dan acara korporat berskala besar.',
  photos: [
    { src: '/img/eternal-1.jpg', alt: 'Resepsi malam bercahaya', caption: 'Wisuda' },
    { src: '/img/eternal-2.jpg', alt: 'Cincin pernikahan', caption: '' },
    { src: '/img/eternal-3.jpg', alt: 'Tamu di acara korporat', caption: '' },
    { src: '/img/eternal-4.jpg', alt: 'Potret pasangan pengantin', caption: 'Potret Editorial' },
  ],
  packages: [
    {
      name: 'Esensial 8 Jam',
      price: 15000000,
      desc: 'Ideal untuk pernikahan intim atau acara setengah hari.',
      popular: false,
      items: [
        '1 Fotografer Utama, 1 Asisten',
        '200 Foto Edit Premium',
        'Galeri Online Khusus (Aktif 1 Tahun)',
        '1 Album Cetak Eksklusif (20×30 cm)',
      ],
    },
    {
      name: 'Lengkap 12 Jam',
      price: 22500000,
      desc: 'Dokumentasi komprehensif dari persiapan hingga pesta selesai.',
      popular: true,
      items: [
        '2 Fotografer Utama, 1 Asisten',
        '400 Foto Edit Premium',
        'Galeri Online & USB Flashdrive Kayu',
        '2 Album Cetak Eksklusif, 1 Cetakan Kanvas Besar',
        'Sesi Foto Pre-wedding (2 Jam)',
      ],
    },
  ],
  gear: [
    'Sony A7R IV & A7S III',
    'G-Master Prime Lenses (24mm, 35mm, 85mm)',
    'Profoto B10X Studio Lighting',
    'DJI Mavic 3 Pro (Aerial)',
  ],
}

export default function FotograferDetailPage() {
  const [packageName, setPackageName] = useState(v.packages[0].name)

  return (
    <div className="mx-auto max-w-[1330px] px-6 pt-12 pb-20 md:px-12">
      <BackButton fallback="/fotografer" />

      <h1 className="mt-5 font-display text-[38px] font-semibold">{v.name}</h1>
      <p className="mt-2 text-[14px] text-[#2e6b52]">{v.badge}</p>
      <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink/75">{v.about}</p>

      {/* PORTOFOLIO */}
      <section className="mt-10">
        <h2 className="font-display text-[19px] font-semibold">Portofolio</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Photo photo={v.photos[0]} className="h-[300px] md:col-span-2 md:h-[510px]" />
          <div className="grid gap-3">
            <Photo photo={v.photos[1]} className="h-[180px] md:h-[249px]" />
            <Photo photo={v.photos[2]} className="h-[180px] md:h-[249px]" />
          </div>
          <Photo photo={v.photos[3]} className="h-[300px] md:h-[510px]" />
        </div>
      </section>

      {/* PAKET */}
      <section className="mt-12 border-t border-line pt-12">
        <h2 className="font-display text-[26px] font-semibold">Paket Dokumentasi</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {v.packages.map((p) => (
            <article
              key={p.name}
              className={`relative flex flex-col rounded-sm bg-lavender/50 p-6 ${
                p.popular ? 'border-2 border-amber' : ''
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 right-5 rounded-full bg-amber px-3 py-0.5 text-[10px] font-semibold text-navy-900">
                  Terpopuler
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-[20px] font-semibold">{p.name}</h3>
                <p className="shrink-0 text-right text-[15px] font-semibold">
                  Rp
                  <br />
                  {p.price.toLocaleString('id-ID')}
                </p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ink/70">{p.desc}</p>

              <ul className="mt-5 space-y-2 text-[12px] text-ink/85">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#2e6b52]" />
                    {i}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setPackageName(p.name)}
                className="mt-auto pt-6"
              >
                <span className="block rounded-sm bg-ink py-2.5 text-center text-[12px] font-semibold text-white transition-opacity hover:opacity-90">
                  Pilih Paket
                </span>
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* SPESIFIKASI ALAT */}
      <section className="mt-12">
        <h2 className="font-display text-[19px] font-semibold">Spesifikasi Alat</h2>
        <div className="mt-4 flex flex-wrap gap-3 rounded-sm bg-lavender/30 p-5">
          {v.gear.map((g) => (
            <span
              key={g}
              className="flex items-center gap-2 rounded-sm border border-line bg-white px-3 py-2 text-[12px]"
            >
              <span className="h-2 w-2 rounded-full bg-navy-900" />
              {g}
            </span>
          ))}
        </div>
      </section>

      {/* ATUR JADWAL */}
      <section className="mt-12 border-t border-line pt-12">
        <h2 className="font-display text-[26px] font-semibold">Atur Jadwal</h2>

        <div className="mt-6 max-w-[860px] border border-line bg-white p-7">
          <label htmlFor="paket" className="block text-[15px] font-semibold">
            Jenis Paket
          </label>
          <div className="relative mt-2 max-w-[300px]">
            <select
              id="paket"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="h-12 w-full appearance-none rounded-sm border border-line bg-white px-3 pr-9 text-[15px] outline-none focus:border-navy-900"
            >
              {v.packages.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
          </div>

          <label htmlFor="event-date" className="mt-6 block text-[15px] font-semibold">
            Tanggal Acara
          </label>
          <div className="relative mt-2 max-w-[300px] border-b border-line pb-1.5">
            <input
              id="event-date"
              type="date"
              defaultValue="2026-01-15"
              className="w-full bg-transparent pr-7 text-[15px] outline-none"
            />
            <CalendarIcon className="pointer-events-none absolute right-1 top-1 h-4 w-4 text-muted" />
          </div>

          <p className="mt-6 text-[15px] font-semibold">Shift Layanan</p>
          <div className="mt-3 flex max-w-[300px] gap-4">
            {shifts.map((s) => (
              <label
                key={s.value}
                className="flex-1 cursor-pointer rounded-sm border border-line py-3 text-center text-[14px] has-checked:border-navy-900 has-checked:bg-navy-900 has-checked:text-white"
              >
                <input type="radio" name="shift" value={s.value} className="sr-only" />
                {s.label}
              </label>
            ))}
          </div>

          {/* Paket, tanggal & shift belum ikut terbawa — nanti lewat POST /schedules/hold. */}
          <Link
            to="pesan"
            className="mt-7 flex h-11 w-full max-w-[220px] items-center justify-center gap-3 rounded-sm bg-amber text-[15px] font-semibold text-navy-900 transition-opacity hover:opacity-90"
          >
            Ajukan Pesanan
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-5 text-[13px] text-muted">
            Paket dipilih: <span className="font-semibold text-ink">{packageName}</span> —{' '}
            {rupiah(v.packages.find((p) => p.name === packageName)?.price ?? 0)}
          </p>
        </div>
      </section>
    </div>
  )
}

function Photo({ photo, className }: { photo: { src: string; alt: string; caption: string }; className: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
      {photo.caption && (
        <span className="absolute bottom-3 left-3 bg-black/45 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
          {photo.caption}
        </span>
      )}
    </div>
  )
}
