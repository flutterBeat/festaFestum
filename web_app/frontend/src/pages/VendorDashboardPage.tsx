import { Link } from 'react-router-dom'
import { VendorPageHeader, StatusPill } from '../components/VendorLayout'
import { ArrowRight, CalendarIcon, ClockIcon, TrendUpIcon, WalletIcon } from '../components/icons'
import { rupiahBulat } from '../lib/format'

/** Ringkasan performa vendor. Semua angka masih contoh — nanti datang dari
 *  agregat bookings + payments milik vendor yang sedang login. */

const stats = {
  revenue: 45_000_000,
  revenueGrowth: '+12% dari bulan lalu',
  totalOrders: 124,
  finishedThisWeek: 24,
  pending: 8,
}

const recentOrders = [
  { initials: 'AW', name: 'Andi Wijaya', date: '15 Okt 2026', service: 'Paket Katering Premium', status: 'Dikonfirmasi' },
  { initials: 'SK', name: 'Siti Kurnia', date: '18 Okt 2026', service: 'Dekorasi Bunga Eksklusif', status: 'Tertunda' },
  { initials: 'BP', name: 'Budi Pratama', date: '20 Okt 2026', service: 'Fotografi Event Full Day', status: 'Dikonfirmasi' },
]

export default function VendorDashboardPage() {
  return (
    <>
      <VendorPageHeader
        title="Selamat datang kembali, Vendor"
        description="Berikut adalah ringkasan performa Anda hari ini."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard label="Pendapatan Bulanan" icon={<WalletIcon />}>
          <p className="text-[26px] font-semibold">{rupiahBulat(stats.revenue)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-amber">
            <TrendUpIcon className="h-3.5 w-3.5" />
            {stats.revenueGrowth}
          </p>
        </StatCard>

        <StatCard label="Total Pemesanan" icon={<CalendarIcon className="h-5 w-5" />}>
          <p className="font-display text-[30px] font-semibold">{stats.totalOrders}</p>
          <p className="mt-1 text-[13px] text-ink/70">{stats.finishedThisWeek} selesai minggu ini</p>
        </StatCard>

        {/* Kartu permintaan tertunda sengaja gelap: ini satu-satunya kartu
            yang menuntut tindakan, bukan sekadar angka. */}
        <section className="rounded-lg bg-navy-900 p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[14px] text-white/85">Permintaan Tertunda</p>
            <span className="rounded-md bg-amber/20 p-2 text-amber">
              <ClockIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 font-display text-[30px] font-semibold">{stats.pending}</p>
          <Link
            to="/vendor/pemesanan"
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-amber text-[13px] font-semibold text-navy-900"
          >
            Tinjau Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-line bg-white">
        <div className="flex items-center justify-between gap-4 p-6">
          <h2 className="font-display text-[24px] font-semibold">Pesanan Terbaru</h2>
          <Link to="/vendor/pemesanan" className="text-[13px] font-medium text-amber">
            Lihat Semua ›
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[14px]">
            <thead className="bg-lavender/30 text-[13px] text-ink/70">
              <tr>
                <th className="px-6 py-3 font-medium">Pelanggan</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Layanan</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.name} className="border-t border-line">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender text-[12px] font-semibold text-navy-900">
                        {o.initials}
                      </span>
                      {o.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">{o.date}</td>
                  <td className="px-6 py-4">{o.service}</td>
                  <td className="px-6 py-4">
                    <StatusPill tone={o.status === 'Tertunda' ? 'warn' : 'info'}>● {o.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function StatCard({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] text-ink/75">{label}</p>
        <span className="rounded-md bg-lavender/50 p-2 text-navy-900">{icon}</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
