import { useState } from 'react'
import OrderLayout, { OrderField, OrderSection, OrderTextarea } from '../components/OrderLayout'
import { CalendarIcon, MapPinIcon, NoteIcon } from '../components/icons'
import { orders } from '../data/mockOrders'

const tabs = [
  { id: 'acara', label: 'BUNGA ACARA' },
  { id: 'buket', label: 'BUKET / HADIAH' },
] as const

export default function FloristOrderPage() {
  const [tab, setTab] = useState<'acara' | 'buket'>('acara')

  return (
    <OrderLayout order={orders.florist}>
      <OrderSection title="Informasi Acara" icon={<CalendarIcon />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <OrderField id="tanggal" label="TANGGAL ACARA" type="date" />
          <OrderField id="waktu" label="WAKTU MULAI" type="time" />
        </div>
        <div className="mt-5 sm:w-1/2 sm:pr-2.5">
          <OrderField id="durasi" label="ESTIMASI DURASI ACARA" placeholder="Contoh: 4 jam" />
        </div>
      </OrderSection>

      {/* Bunga untuk acara dan buket hadiah butuh data yang beda:
          yang satu lokasi venue, yang satu alamat + kartu ucapan penerima. */}
      <OrderSection title="Lokasi/Pengiriman" icon={<MapPinIcon className="h-4 w-4" />}>
        <div className="-mt-6 flex border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`flex-1 border-b-2 pb-3 text-[12px] font-semibold tracking-[0.06em] transition-colors ${
                tab === t.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'acara' ? (
          <div className="mt-6 space-y-5">
            <OrderField id="venue" label="NAMA VENUE/ LOKASI PEMOTRETAN" />
            <OrderTextarea id="alamat" label="ALAMAT LENGKAP" rows={5} />
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <OrderField
                id="penerima"
                label="NAMA PENERIMA"
                placeholder="Nama lengkap penerima buket/hadiah"
              />
              <OrderField
                id="telp-penerima"
                label="NOMOR TELEPON / WHATSAPP PENERIMA"
                type="tel"
                placeholder="Contoh: 0812-3456-7890"
              />
            </div>
            <OrderTextarea
              id="alamat-kirim"
              label="ALAMAT LENGKAP PENGIRIMAN"
              placeholder="Detail jalan, nomor rumah, lantai/apartemen, patokan"
              rows={3}
            />
            <div className="border-t border-line pt-5">
              <OrderTextarea
                id="ucapan"
                label="PESAN PADA KARTU UCAPAN (GREETING CARD)"
                placeholder="Tuliskan ucapan istimewa untuk penerima..."
                rows={3}
              />
            </div>
            <div className="sm:w-1/2 sm:pr-2.5">
              <OrderField
                id="pengirim"
                label="DARI (PENGIRIM DI KARTU)"
                placeholder="Tampilkan nama pengirim atau Anonim"
              />
            </div>
          </div>
        )}
      </OrderSection>

      <OrderSection title="Catatan untuk Vendor" icon={<NoteIcon />}>
        <OrderTextarea id="catatan" label="REQUEST KONSEP ATAU MOMEN KHUSUS" />
      </OrderSection>
    </OrderLayout>
  )
}
