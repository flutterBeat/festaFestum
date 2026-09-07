import OrderLayout, { OrderField, OrderSection, OrderTextarea } from '../components/OrderLayout'
import { CalendarIcon, MapPinIcon, NoteIcon } from '../components/icons'
import { orders } from '../data/mockOrders'

export default function FotograferOrderPage() {
  return (
    <OrderLayout order={orders.fotografer}>
      <OrderSection title="Informasi Acara" icon={<CalendarIcon />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <OrderField id="tanggal" label="TANGGAL ACARA" type="date" />
          <OrderField id="waktu" label="WAKTU MULAI" type="time" />
        </div>
        <div className="mt-5 sm:w-1/2 sm:pr-2.5">
          <OrderField id="durasi" label="ESTIMASI DURASI ACARA" placeholder="Contoh: 8 jam" />
        </div>
      </OrderSection>

      <OrderSection title="Lokasi Acara" icon={<MapPinIcon className="h-4 w-4" />}>
        <div className="space-y-5">
          <OrderField id="venue" label="NAMA VENUE/ LOKASI PEMOTRETAN" />
          <OrderTextarea id="alamat" label="ALAMAT LENGKAP" />
        </div>
      </OrderSection>

      <OrderSection title="Catatan untuk Vendor" icon={<NoteIcon />}>
        <OrderTextarea id="catatan" label="REQUEST KONSEP ATAU MOMEN KHUSUS" />
      </OrderSection>
    </OrderLayout>
  )
}
