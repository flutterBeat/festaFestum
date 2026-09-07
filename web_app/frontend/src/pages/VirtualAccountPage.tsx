import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Img from '../components/Img'
import FlowLayout from '../components/FlowLayout'
import { CopyIcon } from '../components/icons'
import { checkout as o, deposit } from '../data/mockOrders'
import { rupiah } from '../lib/format'

const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000

const instructions = [
  {
    title: 'm-BCA (BCA Mobile)',
    steps: [
      'Buka aplikasi BCA Mobile, pilih m-BCA dan masukkan kode akses Anda.',
      'Pilih menu m-Transfer > BCA Virtual Account.',
      `Masukkan nomor Virtual Account ${o.vaNumber}.`,
      'Pastikan detail pembayaran menampilkan "Festa Festum" dan nominal sesuai.',
      'Masukkan PIN m-BCA Anda untuk mengonfirmasi pembayaran.',
    ],
  },
  {
    title: 'ATM BCA',
    steps: [
      'Masukkan kartu ATM dan PIN Anda.',
      'Pilih menu Transaksi Lainnya > Transfer > ke Rekening BCA Virtual Account.',
      `Masukkan nomor Virtual Account ${o.vaNumber}, lalu tekan Benar.`,
      'Periksa nama dan nominal pembayaran, lalu konfirmasi.',
    ],
  },
  {
    title: 'KlikBCA (Internet Banking)',
    steps: [
      'Login ke KlikBCA dengan User ID dan PIN Anda.',
      'Pilih Transfer Dana > Transfer ke BCA Virtual Account.',
      `Masukkan nomor Virtual Account ${o.vaNumber}.`,
      'Masukkan respon KeyBCA APPLI 1 untuk menyelesaikan pembayaran.',
    ],
  },
]

/** Sisa waktu dalam format HH:MM:SS. */
function countdown(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000))
  const parts = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
  return parts.map((n) => String(n).padStart(2, '0')).join(':')
}

export default function VirtualAccountPage() {
  // Batas waktu dipatok sekali saat halaman dibuka. Nanti datang dari
  // kolom expires_at pesanan, bukan dihitung di browser.
  const [deadline] = useState(() => Date.now() + PAYMENT_WINDOW_MS)
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const total = o.price + deposit(o.price)

  return (
    <FlowLayout>
      <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
        <div className="space-y-7">
          <section className="rounded-sm border border-line bg-white p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <h1 className="font-display text-[28px] font-semibold">Menunggu Pembayaran</h1>
                <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-ink/75">
                  Selesaikan pembayaran Anda sebelum waktu habis untuk menggunakan pesanan.
                </p>
              </div>

              <div className="rounded-sm border border-amber bg-amber/10 px-6 py-3 text-center">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-amber">BATAS WAKTU</p>
                <p className="mt-1 font-display text-[26px] font-semibold text-amber">
                  {countdown(deadline - now)}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.06em]">METODE PEMBAYARAN</p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="rounded-sm bg-lavender/40 px-4 py-2.5 text-[14px] font-bold text-navy-900">
                    {o.bank}
                  </span>
                  <span className="text-[15px]">{o.bank} Virtual Account</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-[0.06em]">NOMOR VIRTUAL ACCOUNT</p>
                <CopyBox className="mt-3" value={o.vaNumber} display={o.vaNumber} />
              </div>
            </div>

            <div className="mt-6 rounded-sm bg-lavender/25 p-6">
              <p className="text-[11px] font-semibold tracking-[0.06em] text-ink/70">TOTAL PEMBAYARAN</p>
              <CopyBox
                className="mt-2"
                bare
                value={String(total)}
                display={<span className="font-display text-[30px] font-semibold">{rupiah(total)}</span>}
              />
            </div>
          </section>

          {/* Accordion pakai <details> bawaan browser — tidak perlu state. */}
          <section className="rounded-sm border border-line bg-white p-7">
            <h2 className="font-display text-[21px] font-semibold">Instruksi Pembayaran</h2>

            <div className="mt-5 space-y-3">
              {instructions.map((ins, i) => (
                <details
                  key={ins.title}
                  open={i === 0}
                  className="rounded-sm border border-line [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-[15px]">
                    {ins.title}
                    <span className="text-ink/50">▾</span>
                  </summary>
                  <ol className="space-y-2.5 border-t border-line px-6 py-4 text-[14px] leading-relaxed text-ink/80">
                    {ins.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-7 lg:sticky lg:top-8">
          <div className="rounded-sm border border-line bg-white p-6">
            {/* Verifikasi asli nanti lewat webhook gateway, bukan tombol ini. */}
            <Link
              to="/pesanan/selesai"
              className="flex h-12 w-full items-center justify-center rounded-sm bg-ink text-[16px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Saya Sudah Bayar
            </Link>
            <Link
              to="/pesanan"
              className="mt-3 flex h-12 w-full items-center justify-center rounded-sm border border-ink text-[16px] transition-colors hover:bg-lavender/30"
            >
              Lihat Status Pesanan
            </Link>
            <p className="mt-4 text-center text-[13px] leading-relaxed text-muted">
              Pembayaran biasanya diverifikasi dalam waktu 1-5 menit
            </p>
          </div>

          <div className="rounded-sm border border-line bg-white p-6">
            <h2 className="border-b border-line pb-4 font-display text-[21px] font-semibold">
              Ringkasan Pesanan
            </h2>

            <div className="flex gap-4 pt-5">
              <Img src={o.image} alt={o.imageAlt} className="h-[90px] w-[90px] shrink-0 object-cover" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.06em] text-amber">{o.category}</p>
                <h3 className="mt-1 font-display text-[21px] font-semibold">{o.vendor}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink/80">
                  {o.eventDateShort} – {o.venue}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </FlowLayout>
  )
}

/** Nilai + tombol salin. Umpan balik "TERSALIN" hilang sendiri setelah 2 detik. */
function CopyBox({
  value,
  display,
  className = '',
  bare = false,
}: {
  value: string
  display: React.ReactNode
  className?: string
  bare?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard diblokir (halaman non-HTTPS atau izin ditolak) — biarkan
      // user menyalin manual, jangan tampilkan error.
    }
  }

  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        bare ? '' : 'rounded-sm border border-line px-4 py-3'
      } ${className}`}
    >
      <span className="text-[17px] font-semibold">{display}</span>
      <button
        type="button"
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold tracking-[0.06em] text-amber hover:opacity-80"
      >
        <CopyIcon className="h-4 w-4" />
        {copied ? 'TERSALIN' : 'SALIN'}
      </button>
    </div>
  )
}
