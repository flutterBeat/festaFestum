import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Img from '../components/Img'
import FlowLayout from '../components/FlowLayout'
import { BankIcon, CardIcon, LockIcon, QrIcon, ShieldIcon } from '../components/icons'
import { checkout as o, deposit, DEPOSIT_RATE } from '../data/mockOrders'
import { rupiah } from '../lib/format'

const methods = [
  { id: 'transfer', label: 'Transfer Bank', icon: <BankIcon />, note: '' },
  { id: 'kartu', label: 'Kartu Kredit', icon: <CardIcon />, note: '' },
  {
    id: 'va',
    label: 'Virtual Account',
    icon: <QrIcon />,
    note: 'Anda akan diarahkan ke halaman pembayaran Virtual Account setelah klik tombol "Bayar Sekarang".',
  },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [method, setMethod] = useState('va')

  const admin = deposit(o.price)

  return (
    <FlowLayout title="Selesaikan Pesanan Anda">
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_460px]">
        <div className="space-y-7">
          <section className="rounded-sm border border-line bg-white">
            <h2 className="border-b border-line px-7 py-5 font-display text-[21px] font-semibold">
              Detail Pesanan
            </h2>

            <div className="p-7">
              <div className="flex flex-wrap items-center gap-8">
                <Img src={o.image} alt={o.imageAlt} className="h-[170px] w-[170px] object-contain" />
                <div>
                  <h3 className="font-display text-[27px] font-semibold">{o.vendor}</h3>
                  <p className="mt-1 text-[15px] text-muted">{o.packageName}</p>
                </div>
              </div>

              <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-[14px] text-muted">Tanggal Acara</dt>
                  <dd className="mt-1.5 font-semibold">{o.eventDate}</dd>
                </div>
                <div>
                  <dt className="text-[14px] text-muted">Lokasi Acara</dt>
                  <dd className="mt-1.5 font-semibold">{o.venue}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="rounded-sm border border-line bg-white p-7">
            <h2 className="font-display text-[21px] font-semibold">Rincian Biaya</h2>

            <dl className="mt-6 space-y-4 text-[15px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Harga Layanan</dt>
                <dd className="text-[17px] font-semibold">{rupiah(o.price)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Biaya Admin ({DEPOSIT_RATE * 100}%)</dt>
                <dd className="text-[17px] font-semibold">{rupiah(admin)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
              <span className="font-display text-[21px] font-semibold">Total Pembayaran</span>
              <span className="text-[19px] font-semibold">{rupiah(o.price + admin)}</span>
            </div>
          </section>
        </div>

        {/* METODE PEMBAYARAN */}
        <aside className="h-fit rounded-sm border border-line bg-white p-6 lg:sticky lg:top-8">
          <h2 className="font-display text-[21px] font-semibold">Metode Pembayaran</h2>

          <div className="mt-5 space-y-3">
            {methods.map((m) => (
              <label
                key={m.id}
                className={`block cursor-pointer rounded-sm border px-4 py-3.5 transition-colors ${
                  method === m.id ? 'border-ink bg-lavender/25' : 'border-line hover:border-ink/40'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="metode"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="h-4 w-4 accent-ink"
                  />
                  <span className="flex-1 text-[15px] font-semibold">{m.label}</span>
                  <span className="text-ink/70">{m.icon}</span>
                </span>

                {/* Catatan hanya relevan untuk metode yang sedang dipilih. */}
                {m.note && method === m.id && (
                  <span className="mt-3 block border-t border-line pt-3 text-[13px] leading-relaxed text-ink/75">
                    {m.note}
                  </span>
                )}
              </label>
            ))}
          </div>

          {/* Gateway belum dipasang — sementara langsung ke halaman VA. */}
          <button
            type="button"
            onClick={() => navigate('/pembayaran')}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2.5 rounded-sm bg-amber text-[16px] font-medium text-navy-900 transition-opacity hover:opacity-90"
          >
            <LockIcon className="h-4 w-4" />
            Bayar Sekarang
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted">
            <ShieldIcon className="h-3.5 w-3.5" />
            Pembayaran diproses secara aman.
          </p>
        </aside>
      </div>
    </FlowLayout>
  )
}
