import OrderLayout, { OrderField, OrderSection, OrderTextarea } from '../components/OrderLayout'
import { CalendarIcon, MapPinIcon, NoteIcon } from '../components/icons'
import { orders } from '../data/mockOrders'

/** Halaman "Lengkapi Detail Pesanan" untuk tiga kategori yang bentuk formnya
 *  identik: MUA, Event Organizer, dan Fotografer. Ketiganya sama-sama minta
 *  tanggal + jam, satu angka perkiraan, lalu lokasi acara — yang berbeda cuma
 *  kata-katanya, jadi semuanya dikumpulkan di tabel `variants` di bawah.
 *
 *  Florist dan Attire TIDAK ikut ke sini: florist punya tab acara/buket dengan
 *  blok alamat yang berbeda total, dan attire tidak punya lokasi acara sama
 *  sekali (yang dibutuhkan ukuran, warna, dan jadwal fitting). Keduanya tetap
 *  punya file sendiri.
 */

type Variant = {
  order: keyof typeof orders
  /** Satu angka perkiraan yang ditanyakan di bawah tanggal & jam. */
  estimate: { id: string; label: string; type?: string; placeholder: string }
  venueLabel: string
  note: { label?: string; placeholder?: string }
}

const variants = {
  mua: {
    order: 'mua',
    estimate: {
      id: 'jumlah-orang',
      label: 'JUMLAH ORANG YANG AKAN DIRIAS',
      type: 'number',
      placeholder: 'Contoh: 3',
    },
    venueLabel: 'NAMA VENUE/ LOKASI',
    note: { label: 'PREFERENSI MAKEUP & REQUEST KHUSUS' },
  },
  eo: {
    order: 'eo',
    estimate: {
      id: 'jumlah-tamu',
      label: 'ESTIMASI JUMLAH TAMU',
      type: 'number',
      placeholder: 'Contoh: 250',
    },
    venueLabel: 'NAMA VENUE/ GEDUNG',
    // Mockup EO tidak memberi label pada textarea catatan.
    note: { placeholder: 'Ceritakan kebutuhan acara Anda...' },
  },
  fotografer: {
    order: 'fotografer',
    estimate: {
      id: 'durasi',
      label: 'ESTIMASI DURASI ACARA',
      placeholder: 'Contoh: 8 jam',
    },
    venueLabel: 'NAMA VENUE/ LOKASI PEMOTRETAN',
    note: { label: 'REQUEST KONSEP ATAU MOMEN KHUSUS' },
  },
} satisfies Record<string, Variant>

export default function VenueOrderPage({ kind }: { kind: keyof typeof variants }) {
  const v = variants[kind]

  return (
    <OrderLayout order={orders[v.order]}>
      <OrderSection title="Informasi Acara" icon={<CalendarIcon />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <OrderField id="tanggal" label="TANGGAL ACARA" type="date" />
          <OrderField id="waktu" label="WAKTU MULAI" type="time" />
        </div>
        <div className="mt-5 sm:w-1/2 sm:pr-2.5">
          <OrderField {...v.estimate} />
        </div>
      </OrderSection>

      <OrderSection title="Lokasi Acara" icon={<MapPinIcon className="h-4 w-4" />}>
        <div className="space-y-5">
          <OrderField id="venue" label={v.venueLabel} />
          <OrderTextarea id="alamat" label="ALAMAT LENGKAP" />
        </div>
      </OrderSection>

      <OrderSection title="Catatan untuk Vendor" icon={<NoteIcon />}>
        <OrderTextarea id="catatan" {...v.note} />
      </OrderSection>
    </OrderLayout>
  )
}
