import { Link } from 'react-router-dom'
import Img from './Img'
import FlowLayout from './FlowLayout'
import { ArrowRight } from './icons'
import { deposit, DEPOSIT_RATE, type OrderSummary } from '../data/mockOrders'
import { rupiah } from '../lib/format'

/** Halaman "Lengkapi Detail Pesanan": form di kiri, ringkasan pesanan
 *  menempel di kanan. Isi formnya beda tiap kategori. */
export default function OrderLayout({ order, children }: { order: OrderSummary; children: React.ReactNode }) {
  const dp = deposit(order.price)

  return (
    <FlowLayout title="Lengkapi Detail Pesanan">
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-7">
          {children}

          <Link
            to={order.backTo}
            className="inline-block border border-ink px-5 py-2.5 text-[12px] font-semibold tracking-wide"
          >
            KEMBALI KE PROFIL VENDOR
          </Link>
        </div>

        {/* RINGKASAN PESANAN */}
        <aside className="h-fit border border-line bg-white lg:sticky lg:top-8">
          <Img src={order.image} alt={order.imageAlt} className="h-[150px] w-full object-cover" />

          <div className="border-t border-line p-6">
            <h2 className="font-display text-[26px] font-semibold">{order.vendor}</h2>
            <p className="mt-2 text-[15px] text-ink/80">{order.packageName}</p>

            <dl className="mt-7 space-y-3 text-[15px]">
              <Row label="Harga Paket" value={rupiah(order.price)} />
              <Row label={`Deposit (${DEPOSIT_RATE * 100}%)`} value={rupiah(dp)} />
            </dl>

            <dl className="mt-7">
              <Row label="Total:" value={rupiah(order.price + dp)} bold />
            </dl>

            <Link
              to="/checkout"
              className="mt-4 flex h-12 w-full items-center justify-center gap-4 rounded-sm bg-amber text-[16px] font-medium text-navy-900 transition-opacity hover:opacity-90"
            >
              Ajukan Pesanan
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </aside>
      </div>
    </FlowLayout>
  )
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={bold ? 'text-[17px]' : 'text-ink/85'}>{label}</dt>
      <dd className={`font-semibold ${bold ? 'text-[17px]' : ''}`}>{value}</dd>
    </div>
  )
}

/** Kotak bersekat yang jadi bahan setiap section form. */
export function OrderSection({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border border-line bg-white p-6 md:p-7">
      <h2 className="flex items-center gap-2.5 font-display text-[19px] font-semibold">
        {icon && <span className="text-amber">{icon}</span>}
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

const fieldClass =
  'mt-2 h-11 w-full rounded-sm border border-line bg-white px-3 text-[14px] outline-none focus:border-navy-900'

/** Label huruf kapital kecil seperti di mockup + input-nya. */
export function OrderField({
  id,
  label,
  type = 'text',
  placeholder,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold tracking-[0.06em] text-ink/70">
        {label}
      </label>
      <input id={id} type={type} placeholder={placeholder} className={fieldClass} />
    </div>
  )
}

export function OrderTextarea({
  id,
  label,
  placeholder,
  rows = 5,
}: {
  id: string
  label?: string
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-[11px] font-semibold tracking-[0.06em] text-ink/70">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[14px] outline-none placeholder:text-ink/35 focus:border-navy-900"
      />
    </div>
  )
}
