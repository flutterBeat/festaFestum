import { useRef, useState } from 'react'
import { VendorPageHeader } from '../components/VendorLayout'
import Img from '../components/Img'
import {
  ChevronDown, ClockIcon, EyeIcon, PhotoIcon, PlusIcon, UploadCloudIcon,
} from '../components/icons'
import { rupiahBulat } from '../lib/format'

/** Katalog layanan + galeri portofolio milik vendor.
 *
 *  "Waktu Persiapan Minimum" = kolom minimum_notice_days di tabel services.
 *  Di mockup nilainya satu untuk seluruh vendor, padahal di DB tiap layanan
 *  punya nilai sendiri (sewa kebaya butuh fitting lama, buket bisa mendadak).
 *  Field di panel kiri diperlakukan sebagai nilai bawaan untuk layanan baru,
 *  dan form tambah layanan boleh menimpanya per layanan.
 */

/** Nilainya harus persis enum vendor_category di DB; labelnya untuk manusia. */
const categories = [
  { value: 'event_organizer', label: 'Event Organizer' },
  { value: 'florist', label: 'Florist' },
  { value: 'attire_rental', label: 'Sewa Jas / Kebaya' },
  { value: 'makeup_artist', label: 'Makeup Artist' },
  { value: 'photographer', label: 'Fotografer' },
] as const

type Service = {
  id: string
  category: string
  name: string
  description: string
  price: number
  noticeDays: number
  image?: string
  imageAlt?: string
}

const initialServices: Service[] = [
  {
    id: 'full-service',
    category: 'event_organizer',
    name: 'Full-Service Orchestration',
    description: 'Perencanaan komprehensif A-Z untuk acara korporat berskala besar.',
    price: 75_000_000,
    noticeDays: 30,
    image: '/img/eo-gala-1.jpg',
    imageAlt: 'Gala dinner korporat',
  },
  {
    id: 'floral-design',
    category: 'florist',
    name: 'Conceptual Floral Design',
    description:
      'Instalasi bunga kustom yang dirancang khusus untuk mencerminkan identitas merek atau tema spesifik acara Anda.',
    price: 15_000_000,
    noticeDays: 7,
    image: '/img/botanica-2.jpg',
    imageAlt: 'Instalasi bunga kustom',
  },
]

const portfolio = [
  { src: '/img/eo-gala-1.jpg', alt: 'Ruang perjamuan penuh tamu' },
  { src: '/img/eo-gala-2.jpg', alt: 'Detail meja perjamuan' },
  { src: '/img/eo-gala-3.jpg', alt: 'Panggung acara korporat' },
]

const PORTFOLIO_LIMIT = 12

const categoryLabel = (value: string) =>
  categories.find((c) => c.value === value)?.label ?? value

export default function VendorLayananPage() {
  const [services, setServices] = useState(initialServices)
  const [defaultNotice, setDefaultNotice] = useState(14)
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <VendorPageHeader
        title="Manajemen Layanan"
        description="Atur penawaran inti Anda, perbarui detail harga, dan kelola portofolio visual untuk menarik klien potensial di ekosistem premium Festa."
        action={
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="flex items-center gap-2 rounded-md bg-navy-900 px-5 py-3 text-[13px] font-semibold text-white"
          >
            <PlusIcon /> Tambah Layanan Baru
          </button>
        }
      />

      <div className="mt-8 grid gap-7 lg:grid-cols-[300px_1fr]">
        <section className="h-fit rounded-lg border border-line bg-white p-6">
          <h2 className="flex items-center gap-2.5 font-display text-[21px] font-semibold">
            <ClockIcon className="h-5 w-5 text-amber" />
            Konfigurasi Operasional
          </h2>
          <p className="mt-3 text-[14px] text-ink/70">
            Tentukan metrik dasar untuk penerimaan pesanan baru.
          </p>

          <div className="mt-6">
            <label htmlFor="notice" className="block text-[12px] font-semibold text-ink/75">
              Waktu Persiapan Minimum
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="notice"
                type="number"
                min={0}
                value={defaultNotice}
                onChange={(e) => setDefaultNotice(Math.max(0, Number(e.target.value)))}
                className="h-11 w-20 rounded-sm border border-line bg-lavender/25 px-3 text-center text-[15px] font-semibold outline-none focus:border-navy-900"
              />
              <span className="text-[14px] text-ink/80">Hari kalender</span>
            </div>
            <p className="mt-2 text-[12px] text-muted">
              Sistem secara otomatis akan memblokir tanggal dalam rentang ini.
            </p>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <label htmlFor="kapasitas" className="block text-[12px] font-semibold text-ink/75">
              Kapasitas Simultan
            </label>
            <div className="relative">
              <select
                id="kapasitas"
                defaultValue="3"
                className="mt-2 h-11 w-full appearance-none rounded-sm border border-line bg-white px-3 pr-9 text-[14px] outline-none focus:border-navy-900"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Event Bersamaan
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 h-4 w-4 text-ink/50" />
            </div>
          </div>

          <button type="button" className="mt-6 text-[13px] font-semibold text-amber">
            Simpan Pengaturan
          </button>
        </section>

        <section>
          <h2 className="border-b border-line pb-3 font-display text-[24px] font-semibold">
            Katalog Layanan Aktif
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <article key={s.id} className="overflow-hidden rounded-lg border border-line bg-white">
                <div className="relative">
                  <Img
                    src={s.image ?? ''}
                    alt={s.imageAlt ?? s.name}
                    className="h-[165px] w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink">
                    {categoryLabel(s.category)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[21px] leading-tight font-semibold">{s.name}</h3>
                  <p className="mt-2 line-clamp-3 text-[13px] text-ink/70">{s.description}</p>
                  <p className="mt-3 text-[12px] text-muted">
                    Butuh pemesanan {s.noticeDays} hari sebelumnya
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.04em] text-ink/60">
                        Harga Mulai Dari
                      </p>
                      <p className="mt-0.5 text-[19px] font-semibold">{rupiahBulat(s.price)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Pratinjau ${s.name}`}
                      className="text-ink/50 hover:text-ink"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-11">
        <h2 className="font-display text-[26px] font-semibold">Galeri Portofolio Utama</h2>
        <p className="mt-1 text-[15px] text-ink/70">
          Unggah representasi visual terbaik dari karya Anda. Klien premium merespons visual
          berkualitas tinggi.
        </p>

        <div className="mt-6 rounded-lg border border-line bg-white p-6">
          <label className="flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed border-line px-6 py-12 text-center transition-colors hover:border-navy-900/40">
            <span className="rounded-lg bg-lavender/50 p-4 text-navy-900">
              <UploadCloudIcon />
            </span>
            <span className="mt-4 font-display text-[21px] font-semibold">Tarik &amp; Lepas Media</span>
            <span className="mt-1 text-[13px] text-ink/70">
              atau klik untuk menelusuri file (JPG, PNG. Max 10MB)
            </span>
            <span className="mt-4 rounded-md border border-line px-4 py-2 text-[13px] font-medium">
              Pilih File
            </span>
            <input type="file" accept="image/jpeg,image/png" multiple className="sr-only" />
          </label>

          <p className="mt-7 text-[12px] font-semibold tracking-[0.04em] text-ink/70">
            Media Tersimpan ({portfolio.length}/{PORTFOLIO_LIMIT})
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {portfolio.map((p) => (
              <Img
                key={p.src}
                src={p.src}
                alt={p.alt}
                className="h-[130px] w-full rounded-md object-cover"
              />
            ))}
            <button
              type="button"
              className="flex h-[130px] w-full items-center justify-center rounded-md border-2 border-dashed border-line text-ink/40 hover:border-navy-900/40 hover:text-ink/70"
              aria-label="Tambah media portofolio"
            >
              <PhotoIcon className="h-7 w-7" />
            </button>
          </div>
        </div>
      </section>

      <AddServiceDialog
        ref={dialogRef}
        defaultNotice={defaultNotice}
        onAdd={(s) => setServices((prev) => [...prev, s])}
      />
    </>
  )
}

/** Form tambah layanan.
 *
 *  Pakai <dialog> bawaan browser, bukan modal buatan sendiri: fokus terkunci
 *  di dalam form, Esc menutup, dan latarnya otomatis inert — semua gratis.
 *
 *  Field-nya sengaja persis kolom yang diminta POST /vendors/:id/services,
 *  jadi penyambungannya nanti tinggal mengganti setServices dengan fetch.
 */
function AddServiceDialog({
  ref,
  defaultNotice,
  onAdd,
}: {
  ref: React.RefObject<HTMLDialogElement | null>
  defaultNotice: number
  onAdd: (service: Service) => void
}) {
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const name = String(data.get('service_name') || '').trim()
    const category = String(data.get('category') || '')
    const price = Number(data.get('price'))
    const noticeDays = Number(data.get('minimum_notice_days'))

    // Divalidasi ulang di sini walaupun input-nya sudah required/min, karena
    // atribut HTML bisa dilewati dan backend pun mengecek hal yang sama.
    if (!name || !category) return setError('Nama layanan dan kategori wajib diisi.')
    if (!Number.isFinite(price) || price < 0) return setError('Harga harus berupa angka positif.')
    if (!Number.isInteger(noticeDays) || noticeDays < 0) {
      return setError('Waktu persiapan harus berupa jumlah hari yang bulat.')
    }

    onAdd({
      id: `${category}-${Date.now()}`,
      name,
      category,
      description: String(data.get('description') || '').trim(),
      price,
      noticeDays,
    })

    setError('')
    form.reset()
    ref.current?.close()
  }

  return (
    <dialog
      ref={ref}
      onClose={() => setError('')}
      className="m-auto w-[min(560px,92vw)] rounded-lg border border-line bg-white p-0 backdrop:bg-navy-900/40"
    >
      <form onSubmit={handleSubmit} className="p-7">
        <h2 className="font-display text-[26px] font-semibold">Tambah Layanan Baru</h2>
        <p className="mt-1 text-[14px] text-ink/70">
          Layanan yang ditambahkan langsung tampil di halaman kategori yang sesuai.
        </p>

        <div className="mt-6 space-y-5">
          <Field id="service_name" label="NAMA LAYANAN" placeholder="Contoh: Paket Wedding Intimate" />

          <div>
            <label htmlFor="category" className="block text-[11px] font-semibold tracking-[0.06em] text-ink/70">
              KATEGORI
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className="mt-2 h-11 w-full appearance-none rounded-sm border border-line bg-white px-3 pr-9 text-[14px] outline-none focus:border-navy-900"
              >
                <option value="" disabled>
                  Pilih kategori…
                </option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 h-4 w-4 text-ink/50" />
            </div>
            <p className="mt-1.5 text-[12px] text-muted">
              Satu vendor boleh menjual lintas kategori — kategori melekat pada layanan, bukan pada
              profil Anda.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="price" label="HARGA (RP)" type="number" min={0} placeholder="15000000" />
            <Field
              id="minimum_notice_days"
              label="WAKTU PERSIAPAN (HARI)"
              type="number"
              min={0}
              defaultValue={defaultNotice}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-[11px] font-semibold tracking-[0.06em] text-ink/70">
              DESKRIPSI
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Jelaskan cakupan layanan, durasi, dan apa saja yang klien dapatkan."
              className="mt-2 w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[14px] outline-none placeholder:text-ink/35 focus:border-navy-900"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-sm bg-maroon/10 px-4 py-3 text-[13px] text-maroon">
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="rounded-md border border-line px-5 py-2.5 text-[13px] font-medium hover:border-ink"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-md bg-navy-900 px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Simpan Layanan
          </button>
        </div>
      </form>
    </dialog>
  )
}

function Field({
  id,
  label,
  type = 'text',
  placeholder,
  min,
  defaultValue,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  min?: number
  defaultValue?: number
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold tracking-[0.06em] text-ink/70">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        min={min}
        required
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-sm border border-line bg-white px-3 text-[14px] outline-none placeholder:text-ink/35 focus:border-navy-900"
      />
    </div>
  )
}
