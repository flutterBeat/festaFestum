import { useState } from 'react'
import { VendorPageHeader, StatusPill } from '../components/VendorLayout'
import { rupiahBulat } from '../lib/format'

/** Daftar pesanan yang masuk ke vendor. Filternya bekerja di sisi klien
 *  karena datanya masih contoh; nanti jadi query ?status= ke API. */

type Status = 'Mendatang' | 'Selesai' | 'Dibatalkan'

const tabs = ['Semua', 'Mendatang', 'Selesai', 'Dibatalkan'] as const

const bookings: {
  id: string
  client: string
  event: string
  date: string
  time: string
  total: number
  status: Status
}[] = [
  {
    id: '#FST-2026-0891',
    client: 'Keluarga Wiryawan',
    event: 'Pernikahan Elegan',
    date: '12 Nov 2026',
    time: '15:00 - 22:00 WIB',
    total: 45_000_000,
    status: 'Mendatang',
  },
  {
    id: '#FST-2026-0885',
    client: 'PT. Gemilang Abadi',
    event: 'Gala Dinner Perusahaan',
    date: '20 Nov 2026',
    time: '18:00 - 23:00 WIB',
    total: 120_500_000,
    status: 'Mendatang',
  },
  {
    id: '#FST-2026-0812',
    client: 'Bapak Susanto',
    event: 'Wisuda Magister',
    date: '02 Okt 2026',
    time: '10:00 - 14:00 WIB',
    total: 15_000_000,
    status: 'Selesai',
  },
  {
    id: '#FST-2026-0774',
    client: 'Ibu Rahmawati',
    event: 'Lamaran Adat',
    date: '18 Sep 2026',
    time: '09:00 - 13:00 WIB',
    total: 8_750_000,
    status: 'Dibatalkan',
  },
]

const tone = { Mendatang: 'info', Selesai: 'muted', Dibatalkan: 'warn' } as const

export default function VendorPemesananPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Semua')
  const rows = tab === 'Semua' ? bookings : bookings.filter((b) => b.status === tab)

  return (
    <>
      <VendorPageHeader
        title="Manajemen Pemesanan"
        description="Kelola daftar pesanan klien Anda dan pantau status acara terkini."
        action={
          <div className="flex rounded-md border border-line bg-white p-1">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`rounded px-4 py-2 text-[13px] transition-colors ${
                  tab === t ? 'bg-navy-900 font-semibold text-white' : 'text-ink/75 hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <section className="mt-8 overflow-hidden rounded-lg border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="bg-lavender/30 text-[12px] tracking-[0.04em] text-ink/70">
              <tr>
                <th className="px-6 py-4 font-semibold">ID PESANAN</th>
                <th className="px-6 py-4 font-semibold">KLIEN &amp; ACARA</th>
                <th className="px-6 py-4 font-semibold">TANGGAL &amp; WAKTU</th>
                <th className="px-6 py-4 text-right font-semibold">TOTAL BIAYA</th>
                <th className="px-6 py-4 font-semibold">STATUS</th>
                <th className="px-6 py-4 font-semibold">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-line align-top">
                  <td className="px-6 py-5 text-ink/80">{b.id}</td>
                  <td className="px-6 py-5">
                    <p className="font-display text-[17px] font-semibold">{b.client}</p>
                    <p className="mt-0.5 text-[13px] text-ink/70">{b.event}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold">{b.date}</p>
                    <p className="mt-0.5 text-[13px] text-ink/70">{b.time}</p>
                  </td>
                  <td className="px-6 py-5 text-right font-semibold">{rupiahBulat(b.total)}</td>
                  <td className="px-6 py-5">
                    <StatusPill tone={tone[b.status]}>{b.status}</StatusPill>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      className="rounded-md border border-line px-4 py-2 text-[13px] font-medium hover:border-ink"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan={6} className="px-6 py-10 text-center text-[14px] text-muted">
                    Belum ada pesanan berstatus {tab.toLowerCase()}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="border-t border-line px-6 py-4 text-[13px] text-ink/70">
          Menampilkan {rows.length} dari {bookings.length} pesanan
        </p>
      </section>
    </>
  )
}
