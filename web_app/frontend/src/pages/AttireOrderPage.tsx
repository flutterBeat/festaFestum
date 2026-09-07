import { useState } from 'react'
import OrderLayout, { OrderField, OrderSection, OrderTextarea } from '../components/OrderLayout'
import { CalendarIcon, ChevronDown, NoteIcon } from '../components/icons'
import { orders } from '../data/mockOrders'

const sizes = ['S', 'M', 'L', 'XL', 'XLL']
const colors = ['Hitam', 'Navy', 'Hijau tua']

export default function AttireOrderPage() {
  const [fitting, setFitting] = useState(true)

  return (
    <OrderLayout order={orders.attire}>
      {/* Sewa busana tidak punya lokasi acara — yang dibutuhkan ukuran,
          warna, dan tiga tanggal (sewa, pengambilan, fitting). */}
      <OrderSection title="Informasi Acara" icon={<CalendarIcon />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select id="ukuran" label="PILIH UKURAN" options={sizes} />
          <Select id="warna" label="PILIH WARNA" options={colors} />
          <OrderField id="tanggal-sewa" label="TANGGAL SEWA" type="date" />
          <OrderField id="tanggal-ambil" label="TANGGAL  PENGAMBILAN" type="date" />
        </div>

        <fieldset className="mt-6 flex items-center gap-6">
          <legend className="float-left mr-6 text-[11px] font-semibold tracking-[0.06em] text-ink/70">
            PERLU FITTING?
          </legend>
          {[
            { label: 'Ya', value: true },
            { label: 'Tidak', value: false },
          ].map((o) => (
            <label key={o.label} className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="radio"
                name="fitting"
                checked={fitting === o.value}
                onChange={() => setFitting(o.value)}
                className="h-4 w-4 accent-ink"
              />
              {o.label}
            </label>
          ))}
        </fieldset>

        {fitting && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <OrderField id="tanggal-fitting" label="TANGGAL  FITTING" type="date" />
            <OrderField id="jam-fitting" label="JAM FITTING" type="time" />
          </div>
        )}
      </OrderSection>

      <OrderSection title="Catatan untuk Vendor" icon={<NoteIcon />}>
        <OrderTextarea id="catatan" label="REQUEST KHUSUS" />
      </OrderSection>
    </OrderLayout>
  )
}

function Select({ id, label, options }: { id: string; label: string; options: string[] }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold tracking-[0.06em] text-ink/70">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          defaultValue=""
          className="mt-2 h-11 w-full appearance-none rounded-sm border border-line bg-white px-3 pr-9 text-[14px] outline-none focus:border-navy-900"
        >
          <option value="" disabled>
            Pilih…
          </option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 h-4 w-4 text-ink/50" />
      </div>
    </div>
  )
}
