import { useMemo, useState } from 'react'
import { VendorPageHeader } from '../components/VendorLayout'
import { ChevronDown } from '../components/icons'
import { shifts } from '../data/shifts'

/** Kalender ketersediaan vendor — sumber data untuk schedule-first discovery.
 *
 *  Aturan mainnya sama dengan tabel vendor_schedules: TIDAK ADA baris berarti
 *  vendor tidak menerima pesanan di slot itu. Jadi default tiap tanggal adalah
 *  tutup, dan vendor membukanya satu per satu. Slot yang sudah 'booked' tidak
 *  bisa ditutup lagi dari sini — pesanannya harus dibatalkan lebih dulu.
 *
 *  Shift-nya ikut src/data/shifts.ts (dua pilihan, mengikuti mockup), bukan
 *  tiga nilai enum di DB. Membuka 'siang' dari sini percuma selama halaman
 *  detail vendor belum menawarkannya ke customer.
 *
 *  Perubahan masih di state komponen. Penyambungannya nanti:
 *  buka slot  -> POST   /api/v1/schedules
 *  tutup slot -> DELETE /api/v1/schedules/:id  (endpoint ini belum ada)
 */

type SlotStatus = 'available' | 'booked'

/** Kunci baris jadwal, sama bentuknya dengan (event_date, time_slot) di DB. */
type Availability = Record<string, Partial<Record<string, SlotStatus>>>

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

/** Contoh isi awal: beberapa tanggal sudah dibuka, satu sudah dipesan. */
const seed: Availability = (() => {
  const base = new Date(today)
  const at = (plusDays: number) => {
    const d = new Date(base)
    d.setDate(d.getDate() + plusDays)
    return iso(d)
  }
  return {
    [at(5)]: { pagi: 'available', malam: 'available' },
    [at(6)]: { malam: 'available' },
    [at(12)]: { pagi: 'available', malam: 'booked' },
    [at(19)]: { pagi: 'available', malam: 'available' },
  }
})()

export default function VendorJadwalPage() {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [availability, setAvailability] = useState<Availability>(seed)
  const [selected, setSelected] = useState<string | null>(null)

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

  const openCount = Object.values(availability).reduce(
    (n, slots) => n + Object.values(slots).filter((s) => s === 'available').length,
    0
  )

  function toggle(date: string, shift: string) {
    setAvailability((prev) => {
      const slots = { ...(prev[date] || {}) }
      if (slots[shift] === 'booked') return prev // sudah dipesan, tidak boleh ditutup
      if (slots[shift] === 'available') delete slots[shift]
      else slots[shift] = 'available'

      const next = { ...prev, [date]: slots }
      if (Object.keys(slots).length === 0) delete next[date]
      return next
    })
  }

  const selectedSlots = selected ? availability[selected] || {} : {}

  return (
    <>
      <VendorPageHeader
        title="Jadwal & Ketersediaan"
        description="Buka tanggal yang bisa dipesan klien. Tanggal yang tidak dibuka tidak akan muncul di hasil pencarian."
        action={
          <div className="rounded-md border border-line bg-white px-5 py-3 text-center">
            <p className="font-display text-[24px] font-semibold">{openCount}</p>
            <p className="text-[12px] text-ink/70">slot terbuka</p>
          </div>
        }
      />

      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-line bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-[22px] font-semibold">
              {monthNames[month.getMonth()]} {month.getFullYear()}
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
                    {values.map((status, n) => (
                      <span
                        key={n}
                        className={`h-1.5 w-1.5 rounded-full ${
                          status === 'booked' ? 'bg-maroon' : 'bg-amber'
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
            <Legend className="bg-maroon">Sudah dipesan</Legend>
            <Legend className="border border-line bg-white">Tutup</Legend>
          </div>
        </section>

        <section className="h-fit rounded-lg border border-line bg-white p-6">
          {!selected ? (
            <p className="text-[14px] text-ink/70">
              Pilih tanggal di kalender untuk membuka atau menutup shift-nya.
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
                  const status = selectedSlots[s.value]
                  const booked = status === 'booked'

                  return (
                    <div
                      key={s.value}
                      className={`flex items-center justify-between gap-3 rounded-md border p-4 ${
                        booked ? 'border-maroon/40 bg-maroon/5' : 'border-line'
                      }`}
                    >
                      <div>
                        <p className="text-[14px] font-semibold">{s.label}</p>
                        <p className="text-[12px] text-ink/65">{s.hours}</p>
                      </div>

                      {booked ? (
                        <span className="rounded-full bg-maroon/10 px-3 py-1 text-[12px] font-medium text-maroon">
                          Sudah dipesan
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggle(selected, s.value)}
                          className={`rounded-md px-4 py-2 text-[12px] font-semibold transition-colors ${
                            status === 'available'
                              ? 'bg-amber text-navy-900'
                              : 'border border-line text-ink/70 hover:border-ink'
                          }`}
                        >
                          {status === 'available' ? 'Terbuka' : 'Tutup'}
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
