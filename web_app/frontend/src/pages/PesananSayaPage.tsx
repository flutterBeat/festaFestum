import { useState } from 'react'
import Img from '../components/Img'
import { SearchIcon, ChevronDown } from '../components/icons'

type Status = 'menunggu' | 'aktif' | 'selesai' | 'dibatalkan'

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/bookings begitu
// halaman ini disambungkan ke backend.
const pesanan = [
  {
    id: '#FF-2026-8841',
    booking: 'Booking: 12 Okt 2026',
    category: 'FOTOGRAFER',
    status: 'menunggu' as Status,
    badge: 'MENUNGGU PELUNASAN AKHIR (50%)',
    badgeTone: 'bg-amber/15 text-amber',
    image: '/img/pesanan-lumina.jpg',
    imageTag: 'PRO TIER',
    vendor: 'Lumina Studios',
    packageLine: 'Paket Resepsi Grand Elegance • Dokumentasi Acara Lengkap',
    lines: ['24 Oktober 2026  (14:00 - 20:00 WIB) • Durasi 6 Jam', 'The Glasshouse Estate, Cilandak, Jakarta Selatan'],
    extra: [],
    finance: {
      title: 'RINCIAN ESCROW',
      right: 'TAHAP 2/2',
      rows: [
        { label: 'DP 50% Lunas:', value: 'Rp 7.500.000' },
        { label: 'Sisa Pelunasan:', value: 'Rp 7.500.000', danger: true },
      ],
      note: '*Dana dipegang aman oleh Festa Escrow dan baru dilepas ke Lumina Studios sesudah konfirmasi hasil foto.',
    },
    footerNote: '',
    actions: [
      { label: 'LIHAT RINCIAN PESANAN', variant: 'soft' },
      { label: 'HUBUNGI VENDOR', variant: 'soft' },
      { label: 'BAYAR PELUNASAN (RP 7.500.000)', variant: 'amber' },
    ],
  },
  {
    id: '#FF-2026-7729',
    booking: 'Booking: 15 Okt 2026',
    category: 'JAS & KEBAYA',
    status: 'aktif' as Status,
    badge: 'SLOT TERKONFIRMASI (DP 50% DITERIMA)',
    badgeTone: 'bg-lavender/60 text-navy-700',
    image: '/img/pesanan-boutique.jpg',
    imageTag: 'ATELIER TAILOR',
    vendor: 'Boutique Elegance',
    packageLine: 'Paket Bespoke Groom & Bride Custom Fitting',
    lines: ['Estimasi Pengambilan: 22 Oktober 2026'],
    extra: [
      { label: 'SPESIFIKASI UKURAN', value: 'Jas: L • Kebaya: M' },
      { label: 'AGENDA FITTING', value: '18 Okt 2026, 11:00 WIB' },
    ],
    finance: {
      title: 'STATUS FINANSIAL',
      right: 'ESCROW HOLD',
      rows: [{ label: 'DP Terbayar:', value: 'Rp 2.750.000' }],
      note: 'Sisa 50% dijamin Escrow saat serah terima pakaian di butik.\nGaransi penyesuaian ukuran gratis 2x fitting',
    },
    footerNote: 'Studio: Senopati Boutique Arcade No. 14, Jakarta',
    actions: [
      { label: 'DETAIL PEMESANAN', variant: 'soft' },
      { label: 'CHAT VENDOR', variant: 'soft' },
      { label: 'ATUR JADWAL FITTING', variant: 'dark' },
    ],
  },
  {
    id: '#FF-2026-6410',
    booking: 'Booking: 18 Okt 2026',
    category: 'FLORIST & GIFT',
    status: 'aktif' as Status,
    badge: 'SEDANG DIRANGKAI & DIKIRIM',
    badgeTone: 'bg-amber/15 text-amber',
    image: '/img/pesanan-botanica.jpg',
    imageTag: 'FRESH FLORAL',
    vendor: 'Botanica Florist',
    packageLine: 'Paket Fresh Bloom Premium • Handwritten Luxury Calligraphy Card',
    lines: [
      'Penerima: Sarah Dania (+62 812-3456-7890)',
      '20 Oktober 2026 (Pagi Shift: 08:30 WIB)',
      'Apartemen Senopati Suites Tower 2, Kebayoran Baru,...',
    ],
    extra: [],
    finance: {
      title: 'PEMBAYARAN PENUH',
      right: '100% ESCROW',
      rows: [{ label: '', value: 'Rp 1.250.000' }],
      note: 'Dana akan diteruskan ke kurir & florist saat foto bukti serah terima terverifikasi.\nUcapan: "Warmest wishes for your..',
    },
    footerNote: 'Kurir Internal Botanica Florist: Armada Berpendingin',
    actions: [
      { label: 'LIHAT KARTU UCAPAN', variant: 'soft' },
      { label: 'HUBUNGI FLORIST', variant: 'soft' },
      { label: 'LACAK PENGIRIMAN', variant: 'dark' },
    ],
  },
  {
    id: '#FF-2026-5102',
    booking: 'Selesai pada: 05 Okt 2026',
    category: 'MAKEUP & HAIR',
    status: 'selesai' as Status,
    badge: 'PESANAN SELESAI & DANA DILEPAS',
    badgeTone: 'bg-[#e6f4ec] text-[#2e6b52]',
    image: '/img/pesanan-aura.jpg',
    imageTag: 'BEAUTY MUA',
    vendor: 'Aura Glam MUA',
    rating: 5,
    packageLine: 'Makeup Wisuda & Keluarga (3 Orang)',
    lines: [],
    extra: [],
    finance: {
      title: 'TOTAL TRANSAKSI',
      right: 'PENCAIRAN BERHASIL',
      rows: [{ label: '', value: 'Rp 3.800.000' }],
      note: 'Dana escrow sebesar Rp 3.800.000 telah dilepaskan ke vendor pada 06 Okt 2026.\nTransaksi selesai tanpa keluhan (Dispute-Free)',
    },
    footerNote: 'Nomor Faktur Pajak: INV-FF/2026/10/00492',
    actions: [
      { label: 'BERI ULASAN TAMBAHAN', variant: 'soft' },
      { label: 'UNDUH INVOICE PDF', variant: 'soft' },
      { label: 'PESAN LAGI', variant: 'dark' },
    ],
  },
]

const tabs: { id: Status | 'semua'; label: string }[] = [
  { id: 'semua', label: 'SEMUA PESANAN' },
  { id: 'menunggu', label: 'MENUNGGU PEMBAYARAN' },
  { id: 'aktif', label: 'AKTIF / BERJALAN' },
  { id: 'selesai', label: 'SELESAI' },
  { id: 'dibatalkan', label: 'DIBATALKAN' },
]

const buttonClass = {
  soft: 'border border-line bg-lavender/25 text-ink hover:bg-lavender/40',
  dark: 'bg-ink text-white hover:opacity-90',
  amber: 'bg-amber text-navy-900 hover:opacity-90',
}

export default function PesananSayaPage() {
  const [tab, setTab] = useState<Status | 'semua'>('semua')
  const [query, setQuery] = useState('')

  const terlihat = pesanan.filter((p) => {
    const cocokTab = tab === 'semua' || p.status === tab
    const teks = `${p.id} ${p.vendor} ${p.category}`.toLowerCase()
    return cocokTab && teks.includes(query.trim().toLowerCase())
  })

  const jumlah = (id: Status | 'semua') =>
    id === 'semua' ? pesanan.length : pesanan.filter((p) => p.status === id).length

  return (
    <div className="mx-auto max-w-[1330px] px-6 pt-12 pb-20 md:px-12">
      <h1 className="font-display text-[34px] font-semibold">Pesanan &amp; Booking Saya</h1>
      <p className="mt-5 max-w-[420px] text-[15px] leading-relaxed text-ink/80">
        Pantau jadwal acara, status pelunasan pembayaran dan koordinasi langsung dengan vendor terpilih
        Anda.
      </p>

      {/* PENCARIAN & FILTER */}
      <div className="mt-8 flex flex-wrap gap-4">
        <div className="relative min-w-[280px] flex-1">
          <SearchIcon className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nomor pesanan, nama vendor, atau jenis layanan..."
            aria-label="Cari pesanan"
            className="h-12 w-full rounded-sm border border-line bg-white pr-4 pl-11 text-[14px] outline-none placeholder:text-ink/40 focus:border-navy-900"
          />
        </div>

        <div className="relative w-[280px]">
          <select
            aria-label="Filter kategori"
            className="h-12 w-full appearance-none rounded-sm border border-line bg-white px-4 pr-9 text-[14px] outline-none focus:border-navy-900"
          >
            {['Semua Layanan (All Categories)', 'Fotografer', 'Jas & Kebaya', 'Florist & Gift', 'Makeup & Hair'].map(
              (o) => (
                <option key={o}>{o}</option>
              )
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink/50" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {tabs.map((t) => {
          const n = jumlah(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              disabled={n === 0}
              className={`rounded-sm px-3.5 py-2 text-[11px] font-semibold tracking-[0.04em] transition-colors ${
                tab === t.id
                  ? 'bg-ink text-white'
                  : n === 0
                    ? 'bg-lavender/20 text-muted'
                    : 'bg-lavender/40 text-ink hover:bg-lavender/60'
              }`}
            >
              {t.label} ({n})
            </button>
          )
        })}
      </div>

      {/* DAFTAR PESANAN */}
      <div className="mt-8 space-y-6">
        {terlihat.map((p) => (
          <article key={p.id} className="border border-line bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3 text-[13px]">
                <span className="font-display text-[17px] font-semibold">{p.id}</span>
                <span className="text-muted">• {p.booking} •</span>
                <span className="rounded-sm bg-lavender/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] text-navy-700">
                  {p.category}
                </span>
              </div>
              <span className={`rounded-sm px-3 py-1.5 text-[10px] font-semibold tracking-[0.04em] ${p.badgeTone}`}>
                {p.badge}
              </span>
            </header>

            <div className="grid gap-6 px-6 pb-5 lg:grid-cols-[210px_1fr_330px]">
              <div className="relative">
                <Img src={p.image} alt={p.vendor} className="h-[130px] w-full object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-black/60 px-2 py-1 text-[9px] font-semibold tracking-[0.04em] text-white">
                  {p.imageTag}
                </span>
              </div>

              <div>
                <h2 className="flex items-center gap-2 font-display text-[21px] font-semibold">
                  {p.vendor}
                  {p.rating && <span className="text-[13px] text-star">{'★'.repeat(p.rating)}</span>}
                </h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink/80">{p.packageLine}</p>

                {p.extra.length > 0 && (
                  <dl className="mt-4 flex flex-wrap gap-8 border-y border-line py-3">
                    {p.extra.map((e) => (
                      <div key={e.label}>
                        <dt className="text-[10px] font-semibold tracking-[0.04em] text-muted">{e.label}</dt>
                        <dd className="mt-1 text-[13px] font-semibold">{e.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <ul className="mt-3 space-y-1.5 text-[13px] text-ink/75">
                  {p.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>

              <div className="h-fit bg-lavender/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold tracking-[0.04em] text-ink/70">
                    {p.finance.title}
                  </span>
                  {p.finance.right && (
                    <span className="text-[9px] font-semibold tracking-[0.04em] text-muted">
                      {p.finance.right}
                    </span>
                  )}
                </div>

                <dl className="mt-2.5 space-y-1">
                  {p.finance.rows.map((r) => (
                    <div key={r.label + r.value} className="flex items-baseline gap-2">
                      {r.label && <dt className="text-[13px]">{r.label}</dt>}
                      <dd
                        className={`font-semibold ${
                          'danger' in r && r.danger ? 'text-[15px] text-[#c0392b]' : 'text-[17px]'
                        }`}
                      >
                        {r.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {p.finance.note.split('\n').map((n) => (
                  <p key={n} className="mt-2 text-[11px] leading-relaxed text-ink/70">
                    {n}
                  </p>
                ))}
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-3.5">
              <span className="text-[11px] text-muted">{p.footerNote}</span>
              <div className="flex flex-wrap gap-2.5">
                {p.actions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    className={`rounded-sm px-3.5 py-2 text-[10px] font-semibold tracking-[0.04em] transition-colors ${
                      buttonClass[a.variant as keyof typeof buttonClass]
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </footer>
          </article>
        ))}

        {terlihat.length === 0 && (
          <p className="border border-line bg-white py-16 text-center text-[15px] text-muted">
            Tidak ada pesanan pada filter ini.
          </p>
        )}
      </div>

      {/* BANTUAN */}
      <section className="mt-10 flex flex-wrap items-center justify-between gap-6 border border-line bg-white p-7">
        <div className="flex gap-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-[18px]">
            🎧
          </span>
          <div className="max-w-[330px]">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-amber">
              LAYANAN PRIORITAS <span className="text-muted">• Tersedia 24/7</span>
            </p>
            <h2 className="mt-1.5 font-display text-[19px] font-semibold">
              Butuh bantuan dengan pesanan Anda?
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink/75">
              Tim Concierge Festa Festum siap membantu mediasi vendor, penyesuaian jadwal acara penting,
              hingga konfirmasi pengembalian dana perlindungan escrow.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-sm border border-line bg-lavender/25 px-4 py-2.5 text-[11px] font-semibold tracking-[0.04em] transition-colors hover:bg-lavender/40"
          >
            PUSAT BANTUAN FAQ
          </button>
          <button
            type="button"
            className="rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.04em] text-white transition-opacity hover:opacity-90"
          >
            HUBUNGI CONCIERGE
          </button>
        </div>
      </section>
    </div>
  )
}
