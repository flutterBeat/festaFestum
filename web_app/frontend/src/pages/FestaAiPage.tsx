import { useState } from 'react'
import Img from '../components/Img'
import { ChevronDown, SearchIcon } from '../components/icons'
import { rupiah } from '../lib/format'

const parameterFields = [
  { id: 'tipe', label: 'Tipe Acara', options: ['Pernikahan', 'Wisuda', 'Gala Dinner', 'Konferensi'] },
  { id: 'tamu', label: 'Jumlah Tamu', options: ['< 50', '50-100', '100-150', '150-300', '> 300'] },
  {
    id: 'budget',
    label: 'Target Budget',
    options: [
      'Rp 10.000.000 - 50.000.000',
      'Rp 50.000.000 - 100.000.000',
      'Rp 100.000.000 - 250.000.000',
      '> Rp 250.000.000',
    ],
  },
]

const fokusOptions = ['Dekorasi', 'Dokumentasi', 'Katering', 'Hiburan', 'Busana', 'Rias']

// Hasil contoh sesuai mockup. Diganti hasil POST /api/v1/ai/recommend
// (Smart Planner buatan AI Engineer) begitu servicenya siap.
const rekomendasi = [
  {
    vendor: 'Nusantara Grand EO',
    desc: 'Paket pernikahan dengan konsep elegan dan layanan acara yang lengkap.',
    tag: '100-150 Orang',
    price: 21000000,
    image: '/img/eo-nusantara.jpg',
  },
  {
    vendor: 'Ethereal Beauty MUA',
    desc: 'Layanan tata rias profesional untuk menyempurnakan penampilan di hari spesial Anda.',
    tag: '',
    price: 15000000,
    image: '/img/mua-velvet.jpg',
  },
  {
    vendor: 'Kenangan Florist',
    desc: 'Rangkaian bunga dan dekorasi floral untuk memperindah seluruh rangkaian acara.',
    tag: '',
    price: 3500000,
    image: '/img/florist-kenangan.jpg',
  },
]

export default function FestaAiPage() {
  const [fokus, setFokus] = useState<string[]>([])

  const total = rekomendasi.reduce((sum, r) => sum + r.price, 0)

  const toggleFokus = (f: string) =>
    setFokus((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))

  return (
    <div className="mx-auto max-w-[1330px] px-6 py-10 md:px-12">
      <div className="grid gap-10 lg:grid-cols-[420px_1fr]">
        {/* PARAMETER */}
        <aside className="h-fit rounded-sm border border-line bg-white p-7 lg:sticky lg:top-[90px]">
          <h1 className="border-b border-line pb-5 font-display text-[30px] font-semibold">
            Parameter Acara
          </h1>

          <div className="mt-6 space-y-5">
            {parameterFields.map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-[15px]">
                  {f.label}
                </label>
                <div className="relative mt-2">
                  <select
                    id={f.id}
                    className="h-12 w-full appearance-none rounded-sm border border-line bg-white px-4 pr-10 text-[15px] outline-none focus:border-navy-900"
                  >
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-ink/50" />
                </div>
              </div>
            ))}
          </div>

          {/* Mockup menampilkan dua kotak kosong; diisi pilihan fokus yang
              bisa dicentang lebih dari satu. */}
          <p className="mt-5 text-[15px]">Fokus Prioritas</p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {fokusOptions.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFokus(f)}
                aria-pressed={fokus.includes(f)}
                className={`rounded-sm border py-2.5 text-[13px] transition-colors ${
                  fokus.includes(f)
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-line bg-white hover:border-navy-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Belum ada aksi — nyambung ke POST /api/v1/ai/recommend nanti. */}
          <button
            type="button"
            className="mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-sm bg-navy-900 text-[17px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <SearchIcon className="h-5 w-5" />
            Cari Paket
          </button>
        </aside>

        {/* HASIL */}
        <section>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-[32px] font-semibold">Rekomendasi Festa AI</h2>
              <p className="mt-2 max-w-[500px] text-[14px] leading-relaxed text-ink/75">
                Berdasarkan parameter acara yang Anda masukkan, Festa AI telah memilih beberapa paket
                yang paling sesuai untuk Anda.
              </p>
            </div>
            <p className="font-display text-[24px] font-semibold">{rupiah(total)}</p>
          </div>

          <div className="mt-6 space-y-6">
            {rekomendasi.map((r) => (
              <article
                key={r.vendor}
                className="grid gap-6 rounded-sm border border-line bg-white p-4 sm:grid-cols-[320px_1fr]"
              >
                <Img src={r.image} alt={r.vendor} className="h-[200px] w-full object-cover" />

                <div className="flex flex-col py-2 pr-2">
                  <h3 className="font-display text-[26px] font-semibold">{r.vendor}</h3>
                  <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-ink/75">{r.desc}</p>
                  {r.tag && (
                    <span className="mt-3 w-fit rounded-sm bg-[#fdeceb] px-3 py-1.5 text-[13px] text-[#c0392b]">
                      {r.tag}
                    </span>
                  )}
                  <p className="mt-auto pt-6 text-right font-display text-[24px] font-semibold">
                    {rupiah(r.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
