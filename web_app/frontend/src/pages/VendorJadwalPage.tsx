import { useCallback, useEffect, useMemo, useState } from 'react'
import { VendorPageHeader } from '../components/VendorLayout'
import { ChevronDown } from '../components/icons'
import { shifts } from '../data/shifts'
import { listMySchedules, tutupSlot, ubahKapasitas, getMyVendor, kirim } from '../lib/api'

/** Kalender ketersediaan vendor — sumber data untuk schedule-first discovery.
 *
 *  ARAHNYA TERBALIK sejak migrasi 013. Dulu: tidak ada baris = tutup, dan
 *  vendor membuka slotnya satu per satu — yang berarti vendor baru lahir
 *  dalam keadaan tidak bisa dipesan sampai dia mengisi kalender ini. Sekarang
 *  vendor tersedia secara bawaan, dan yang dicatat justru penutupannya.
 *
 *  Status yang datang dari server sudah diturunkan di sana:
 *    available -> tidak ditutup, kapasitas hari itu masih sisa
 *    blocked   -> vendor menutupnya sendiri (punya schedule_id, bisa dicabut)
 *    booked    -> ada pesanan aktif, atau kapasitas harian sudah habis
 *
 *  Kapasitas harian bikin satu tanggal bisa penuh walau shift-nya kosong:
 *  vendor berkapasitas 1 yang dipesan pagi otomatis penuh seharian.
 *
 *  Sudah tersambung ke backend:
 *  baca        -> GET    /api/v1/schedules/me?from=&to=
 *  tutup slot  -> POST   /api/v1/schedules
 *  buka lagi   -> DELETE /api/v1/schedules/:id
 *
 *  Perubahan dikirim ke server dulu, baru state lokal ikut. Kalau dibalik,
 *  kalender bisa menampilkan penutupan yang sebenarnya gagal tersimpan.
 */

type SlotStatus = 'available' | 'booked' | 'held' | 'blocked'

/** Satu petak kalender. `id` hanya terisi kalau petak itu memang penutupan
 *  — DELETE butuh schedule_id, dan petak 'available' tidak punya baris. */
type Slot = { id: string | null; status: SlotStatus; customer: string | null }

/** Kunci baris jadwal, sama bentuknya dengan (event_date, time_slot) di DB. */
type Availability = Record<string, Partial<Record<string, Slot>>>

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/** Minggu dimulai Senin, seperti kalender yang biasa dipakai di Indonesia. */
const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const today = new Date()
today.setHours(0, 0, 0, 0)


export default function VendorJadwalPage() {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [availability, setAvailability] = useState<Availability>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState('')
  // Berapa pesanan yang sanggup dilayani dalam sehari. Vendor berkapasitas 1
  // otomatis penuh seharian begitu dapat satu pesanan; itu yang dulu jadi
  // aturan "kunci seharian" yang dipatok per kategori.
  const [kapasitas, setKapasitas] = useState(1)
  const [vendorId, setVendorId] = useState('')
  const [simpanKapasitas, setSimpanKapasitas] = useState('')

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    // getDay(): 0 = Minggu. Digeser supaya Senin jadi kolom pertama.
    const offset = (first.getDay() + 6) % 7
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: total }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    ]
  }, [month])

  // Rentang dibatasi per bulan yang sedang dilihat — GET /schedules/me memang
  // mewajibkan from & to supaya tidak menarik ribuan baris sekaligus.
  const muat = useCallback(async () => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    setMemuat(true)
    setGalat('')
    try {
      const r = await listMySchedules(iso(first), iso(last))
      const next: Availability = {}
      for (const row of r.data) {
        const tgl = row.event_date.slice(0, 10)
        next[tgl] = {
          ...(next[tgl] || {}),
          [row.time_slot]: {
            id: row.schedule_id,
            status: row.status,
            customer: row.customer_name,
          },
        }
      }
      setAvailability(next)
      setKapasitas(r.daily_capacity)
    } catch (e) {
      setGalat((e as Error).message)
    } finally {
      setMemuat(false)
    }
  }, [month])

  // muat() tidak pernah memanggil setState secara sinkron: semuanya sesudah
  // await, jadi satu kali muat = satu kali render, bukan render berantai yang
  // dicegah aturan di bawah. Menyalin isi muat() ke dalam efek cuma untuk
  // mendiamkan linter berarti dua salinan logika pengambilan data per halaman.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { muat() }, [muat])

  // vendor_id tidak ikut di /schedules/me, padahal PATCH kapasitas butuh dia.
  useEffect(() => {
    getMyVendor()
      .then((r) => setVendorId(r.vendor.vendor_id))
      .catch(() => {})
  }, [])

  async function simpanKap(n: number) {
    if (!vendorId || n === kapasitas) return
    setSimpanKapasitas('menyimpan')
    setGalat('')
    try {
      await ubahKapasitas(vendorId, n)
      setSimpanKapasitas('tersimpan')
      // Kapasitas mengubah tanggal mana yang terbaca penuh, jadi kalendernya
      // ikut dimuat ulang dari server.
      await muat()
    } catch (e) {
      setGalat((e as Error).message)
      setSimpanKapasitas('')
    }
  }

  const openCount = Object.values(availability).reduce(
    (n, slots) => n + Object.values(slots).filter((s) => s && s.status === 'available').length,
    0
  )
  const tutupCount = Object.values(availability).reduce(
    (n, slots) => n + Object.values(slots).filter((s) => s && s.status === 'blocked').length,
    0
  )

  async function toggle(date: string, shift: string) {
    const kini = availability[date]?.[shift]
    // Petak yang sudah terisi pesanan tidak boleh diapa-apakan dari sini;
    // backend juga menolaknya dengan menyebut slot mana yang bentrok.
    if (!kini || kini.status === 'booked') return

    setSibuk(date + shift)
    setGalat('')
    try {
      if (kini.status === 'blocked' && kini.id) {
        await kirim(`/schedules/${kini.id}`, 'DELETE')
      } else {
        await tutupSlot([{ event_date: date, time_slot: shift }])
      }
      // Muat ulang dari server, bukan menebak hasilnya di klien.
      await muat()
    } catch (e) {
      setGalat((e as Error).message)
    } finally {
      setSibuk('')
    }
  }

  const selectedSlots = selected ? availability[selected] || {} : {}

  return (
    <>
      <VendorPageHeader
        title="Jadwal & Ketersediaan"
        description="Anda tersedia secara bawaan. Tutup tanggal yang tidak bisa Anda layani — tanggal yang ditutup tidak akan muncul di hasil pencarian."
        action={
          <div className="flex gap-3">
            <div className="rounded-md border border-line bg-white px-5 py-3 text-center">
              <p className="font-display text-[24px] font-semibold">{openCount}</p>
              <p className="text-[12px] text-ink/70">
                slot terbuka{tutupCount > 0 && `, ${tutupCount} ditutup`}
              </p>
            </div>
            <div className="rounded-md border border-line bg-white px-5 py-3 text-center">
              <label htmlFor="kapasitas" className="sr-only">Pesanan per hari</label>
              <input
                id="kapasitas"
                type="number"
                min={1}
                max={99}
                value={kapasitas}
                onChange={(e) => setKapasitas(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                onBlur={(e) => simpanKap(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                className="w-16 rounded border border-line text-center font-display text-[24px] font-semibold"
              />
              <p className="text-[12px] text-ink/70">
                pesanan/hari{simpanKapasitas === 'tersimpan' && ' ✓'}
              </p>
            </div>
          </div>
        }
      />

      {galat && (
        <p className="mt-6 border border-maroon/30 bg-maroon/5 px-5 py-3 text-[13px] text-maroon">
          {galat}
        </p>
      )}

      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-line bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-[22px] font-semibold">
              {monthNames[month.getMonth()]} {month.getFullYear()}
              {memuat && <span className="ml-3 text-[13px] font-normal text-muted">memuat...</span>}
            </h2>
            <div className="flex gap-2">
              <MonthButton
                label="Bulan sebelumnya"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                rotate="rotate-90"
              />
              <MonthButton
                label="Bulan berikutnya"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                rotate="-rotate-90"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-1.5 text-center text-[12px] font-semibold text-ink/60">
            {dayNames.map((d) => (
              <div key={d} className="pb-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {days.map((date, i) => {
              if (!date) return <div key={`pad-${i}`} />

              const key = iso(date)
              const slots = availability[key] || {}
              const values = Object.values(slots)
              const isPast = date < today
              const isSelected = key === selected

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isPast}
                  onClick={() => setSelected(key)}
                  aria-pressed={isSelected}
                  className={`flex h-[74px] flex-col items-start rounded-md border p-2 text-left transition-colors ${
                    isSelected ? 'border-ink bg-lavender/40' : 'border-line hover:border-navy-900/40'
                  } ${isPast ? 'cursor-not-allowed opacity-35' : ''}`}
                >
                  <span className="text-[13px] font-semibold">{date.getDate()}</span>
                  <span className="mt-auto flex gap-1">
                    {values.map((slot, n) => (
                      <span
                        key={n}
                        className={`h-1.5 w-1.5 rounded-full ${
                          slot && slot.status !== 'available' ? 'bg-maroon' : 'bg-amber'
                        }`}
                      />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-5 border-t border-line pt-4 text-[12px] text-ink/70">
            <Legend className="bg-amber">Terbuka</Legend>
            <Legend className="bg-maroon">Terisi / penuh</Legend>
            <Legend className="border border-line bg-white">Anda tutup</Legend>
          </div>
        </section>

        <section className="h-fit rounded-lg border border-line bg-white p-6">
          {!selected ? (
            <p className="text-[14px] text-ink/70">
              Pilih tanggal di kalender untuk menutup atau membuka kembali shift-nya.
            </p>
          ) : (
            <>
              <p className="text-[12px] font-semibold tracking-[0.04em] text-ink/60">TANGGAL DIPILIH</p>
              <h2 className="mt-1 font-display text-[22px] font-semibold">
                {new Date(selected).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>

              <div className="mt-6 space-y-3">
                {shifts.map((s) => {
                  const slot = selectedSlots[s.value]
                  // Terisi pesanan atau kapasitas harian habis: vendor tidak
                  // bisa menutupnya, pesanannya harus dibatalkan lebih dulu.
                  const terkunci = !!slot && slot.status === 'booked'
                  const terbuka = !!slot && slot.status === 'available'
                  const sedang = sibuk === selected + s.value

                  return (
                    <div
                      key={s.value}
                      className={`flex items-center justify-between gap-3 rounded-md border p-4 ${
                        terkunci ? 'border-maroon/40 bg-maroon/5' : 'border-line'
                      }`}
                    >
                      <div>
                        <p className="text-[14px] font-semibold">{s.label}</p>
                        <p className="text-[12px] text-ink/65">{s.hours}</p>
                      </div>

                      {terkunci ? (
                        <span className="rounded-full bg-maroon/10 px-3 py-1 text-right text-[12px] font-medium text-maroon">
                          {slot.customer ? 'Sudah dipesan' : 'Kapasitas penuh'}
                          {slot.customer && (
                            <span className="block text-[11px] font-normal">{slot.customer}</span>
                          )}
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={sedang}
                          onClick={() => toggle(selected, s.value)}
                          className={`rounded-md px-4 py-2 text-[12px] font-semibold transition-colors disabled:opacity-50 ${
                            terbuka
                              ? 'bg-amber text-navy-900'
                              : 'border border-line text-ink/70 hover:border-ink'
                          }`}
                        >
                          {sedang ? 'Menyimpan...' : terbuka ? 'Terbuka — klik untuk tutup' : 'Ditutup — klik untuk buka'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="mt-5 text-[12px] text-muted">
                Slot yang sudah dipesan hanya bisa dilepas dengan membatalkan pesanannya di menu
                Pemesanan.
              </p>
            </>
          )}
        </section>
      </div>
    </>
  )
}

function MonthButton({
  label,
  onClick,
  rotate,
}: {
  label: string
  onClick: () => void
  rotate: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md border border-line p-2 text-ink/70 hover:border-ink hover:text-ink"
    >
      <ChevronDown className={`h-4 w-4 ${rotate}`} />
    </button>
  )
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {children}
    </span>
  )
}
