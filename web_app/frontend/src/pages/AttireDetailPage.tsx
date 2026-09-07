import { useState } from 'react'
import { Link } from 'react-router-dom'
import Img from '../components/Img'
import VendorLocation from '../components/VendorLocation'
import BackButton from '../components/BackButton'
import { ArrowRight, CalendarIcon } from '../components/icons'
import { rupiah } from '../lib/format'

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors/:id begitu
// halaman ini disambungkan ke backend.
const v = {
  name: 'Javanesse Attire',
  badge: 'Sewa Jas/Kebaya',
  about:
    'Atelier Elegance menghadirkan perpaduan sempurna antara tradisi dan modernitas. Setiap potong jas dan kebaya dalam koleksi kami dirancang oleh perancang busana terkemuka, menggunakan material berkualitas tertinggi untuk memastikan kenyamanan dan tampilan memukau di hari istimewa Anda. Kami menyediakan layanan kustomisasi ukuran agar setiap pakaian memeluk tubuh Anda dengan sempurna.',
  priceEstimate: 500000,
  photos: [
    { src: '/img/javanesse-1.jpg', alt: 'Jas hitam di butik' },
    { src: '/img/javanesse-2.jpg', alt: 'Detail kain bordir' },
    { src: '/img/javanesse-3.jpg', alt: 'Kebaya di depan cermin' },
  ],
  colors: [
    { name: 'Hitam', hex: '#111111' },
    { name: 'Navy', hex: '#1a3263' },
    { name: 'Hijau tua', hex: '#2e4034' },
  ],
}

/** Jas dan kebaya dijual dari halaman yang sama — yang membedakan cuma
 *  panduan ukurannya, jadi tabelnya ikut kategori yang dipilih. */
const sizeGuides = {
  jas: [
    { size: 'S', rows: ['Lingkar Dada : 86-90 cm', 'Lingkar Pinggang : 72-76 cm', 'Lingkar Bahu : 42 cm'] },
    { size: 'M', rows: ['Lingkar Dada : 91-95 cm', 'Lingkar Pinggang : 77-81 cm', 'Lingkar Bahu : 44 cm'] },
    { size: 'L', rows: ['Lingkar Dada : 96-100 cm', 'Lingkar Pinggang : 82-86 cm', 'Lingkar Bahu : 46 cm'] },
    { size: 'XL', rows: ['Lingkar Dada : 101-105 cm', 'Lingkar Pinggang : 87-91 cm', 'Lingkar Bahu : 48 cm'] },
    { size: 'XXL', rows: ['Lingkar Dada : 106-110 cm', 'Lingkar Pinggang : 92-96 cm', 'Lingkar Bahu : 50 cm'] },
  ],
  kebaya: [
    { size: 'S', rows: ['Lingkar Dada : 82-86 cm', 'Lingkar Pinggang : 64-68 cm', 'Lingkar Pinggul : 88-92 cm', 'Lebar Bahu : 36-38 cm'] },
    { size: 'M', rows: ['Lingkar Dada : 87-91 cm', 'Lingkar Pinggang : 69-73 cm', 'Lingkar Pinggul : 93-97 cm', 'Lebar Bahu : 39-41 cm'] },
    { size: 'L', rows: ['Lingkar Dada : 92-96 cm', 'Lingkar Pinggang : 74-78 cm', 'Lingkar Pinggul : 98-102 cm', 'Lebar Bahu : 42-44 cm'] },
    { size: 'XL', rows: ['Lingkar Dada : 97-101 cm', 'Lingkar Pinggang : 79-83 cm', 'Lingkar Pinggul : 103-107 cm', 'Lebar Bahu : 45-47 cm'] },
    { size: 'XXL', rows: ['Lingkar Dada : 102-106 cm', 'Lingkar Pinggang : 84-88 cm', 'Lingkar Pinggul : 108-112 cm', 'Lebar Bahu : 48-50 cm'] },
  ],
}

const sizes = ['S', 'M', 'L', 'XL', 'XLL']

/** Tombol pilihan dua-arah (Jas/Kebaya, Ya/Tidak). Terpilih = navy. */
function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-11 flex-1 rounded-sm border text-[14px] font-medium transition-colors ${
        active ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-ink hover:border-navy-900'
      }`}
    >
      {children}
    </button>
  )
}

export default function AttireDetailPage() {
  const [kategori, setKategori] = useState<'jas' | 'kebaya'>('jas')
  const [size, setSize] = useState('')
  const [color, setColor] = useState(v.colors[0].hex)
  const [fitting, setFitting] = useState(true)

  return (
    <div className="mx-auto max-w-[1330px] px-6 pt-12 pb-20 md:px-12">
      <BackButton fallback="/jas-kebaya" />

      <h1 className="mt-5 font-display text-[38px] font-semibold">{v.name}</h1>
      <p className="mt-2 text-[14px] text-[#2e6b52]">{v.badge}</p>

      {/* GALERI: satu foto tinggi di kiri, dua bertumpuk di kanan. */}
      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <Img src={v.photos[0].src} alt={v.photos[0].alt} className="h-[400px] w-full object-cover md:h-[640px]" />
        <div className="grid gap-3">
          <Img src={v.photos[1].src} alt={v.photos[1].alt} className="h-[200px] w-full object-cover md:h-[310px]" />
          <Img src={v.photos[2].src} alt={v.photos[2].alt} className="h-[200px] w-full object-cover md:h-[318px]" />
        </div>
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="font-display text-[17px] font-semibold">Tentang Koleksi</h2>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.85] text-ink/85">{v.about}</p>

          <h2 className="mt-12 border-t border-line pt-12 font-display text-[26px] font-semibold">
            Paduan Ukuran
          </h2>
          <p className="mt-3 max-w-[520px] text-[12px] leading-relaxed text-ink/70">
            Pilih ukuran yang sesuai untuk kenyamanan maksimal. Layanan fitting tersedia untuk membantu
            memastikan pakaian pas saat digunakan.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sizeGuides[kategori].map((g) => (
              <div key={g.size} className="border border-lavender bg-lavender/40 p-4">
                <span className="inline-block rounded-sm bg-[#8f9bd4] px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {g.size}
                </span>
                <ul className="mt-3 space-y-1 border-t border-white/70 pt-3 text-[11px] leading-relaxed text-ink/85">
                  {g.rows.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL PEMESANAN */}
        <aside className="h-fit border border-line bg-white p-5 lg:sticky lg:top-[90px]">
          <p className="rounded-sm bg-navy-900 px-4 py-3.5 text-[15px] font-semibold text-white">
            Detail Informasi
          </p>

          <p className="mt-5 text-[15px] font-semibold">Pilihan Kategori</p>
          <div className="mt-2 flex gap-4">
            <Toggle active={kategori === 'jas'} onClick={() => setKategori('jas')}>
              Jas
            </Toggle>
            <Toggle active={kategori === 'kebaya'} onClick={() => setKategori('kebaya')}>
              Kebaya
            </Toggle>
          </div>

          <p className="mt-5 text-[15px] font-semibold">Input Ukuran</p>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`h-10 rounded-sm border text-[13px] transition-colors ${
                  size === s ? 'border-navy-900 bg-lavender/50 font-semibold' : 'border-line bg-white hover:border-navy-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <p className="mt-5 text-[15px] font-semibold">Pilih Warna</p>
          <div className="mt-2 flex gap-2">
            {v.colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-label={c.name}
                aria-pressed={color === c.hex}
                style={{ backgroundColor: c.hex }}
                className={`h-8 w-9 rounded-sm ring-offset-2 transition-shadow ${
                  color === c.hex ? 'ring-2 ring-navy-900' : ''
                }`}
              />
            ))}
          </div>

          <DateField id="jadwal-sewa" label="Jadwal Sewa" defaultValue="2026-11-05" />
          <DateField id="jadwal-ambil" label="Jadwal Pengambilan" defaultValue="2026-11-08" />

          <p className="mt-5 text-[15px] font-semibold">Perlu Fitting?</p>
          <div className="mt-2 flex gap-4">
            <Toggle active={fitting} onClick={() => setFitting(true)}>
              Ya
            </Toggle>
            <Toggle active={!fitting} onClick={() => setFitting(false)}>
              Tidak
            </Toggle>
          </div>

          {/* Jadwal fitting hanya relevan kalau user memang mau fitting. */}
          {fitting && <DateField id="jadwal-fitting" label="Jadwal Fitting" defaultValue="2026-11-03" />}

          <div className="mt-6 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[14px] text-ink/80">Estimasi Harga Sewa</span>
            <span className="font-display text-[19px] font-semibold">{rupiah(v.priceEstimate)}</span>
          </div>

          {/* Ukuran, warna & tanggal belum ikut terbawa — nanti lewat POST /schedules/hold. */}
          <Link
            to="pesan"
            className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-sm bg-amber text-[15px] font-semibold text-navy-900 transition-opacity hover:opacity-90"
          >
            Lanjutkan Pesanan
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

function DateField({ id, label, defaultValue }: { id: string; label: string; defaultValue: string }) {
  return (
    <>
      <label htmlFor={id} className="mt-5 block text-[15px] font-semibold">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type="date"
          defaultValue={defaultValue}
          className="h-11 w-full rounded-sm border border-line bg-white px-3 pr-9 text-[14px] outline-none focus:border-navy-900"
        />
        <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
    </>
  )
}
