import { VendorPageHeader, StatusPill } from '../components/VendorLayout'
import {
  ArrowRight, DownloadIcon, FilterIcon, InfoIcon, LockIcon, WalletIcon,
} from '../components/icons'
import { rupiahBulat } from '../lib/format'

/** Arus kas vendor: saldo yang bisa ditarik, dana yang masih ditahan escrow,
 *  dan riwayat transaksinya.
 *
 *  Seluruh angka masih contoh. Escrow-nya sendiri belum ada — dananya baru
 *  benar-benar bergerak setelah payment gateway tersambung, karena rilis dari
 *  escrow ke saldo dipicu oleh pelunasan + konfirmasi penyelesaian acara.
 */

const PLATFORM_FEE_RATE = 0.025

const balance = {
  available: 24_500_000,
  inEscrow: 12_850_000,
  escrowOrders: 3,
}

type Row = {
  id: string
  client: string
  date: string
  amount: number
  status: 'Released' | 'In Escrow' | 'Withdrawn'
}

const history: Row[] = [
  { id: 'TRX-9821-FESTA', client: 'Wedding - Sarah & John', date: '12 Okt 2026', amount: 15_000_000, status: 'Released' },
  { id: 'TRX-1044-FESTA', client: 'Corporate Gala - PT. Alpha', date: '15 Okt 2026', amount: 8_500_000, status: 'In Escrow' },
  { id: 'TRX-1102-FESTA', client: 'Graduation Dinner - Elara', date: '18 Okt 2026', amount: 4_350_000, status: 'In Escrow' },
  { id: 'WD-0019-BCA', client: 'Penarikan Dana ke Rekening', date: '05 Okt 2026', amount: -10_000_000, status: 'Withdrawn' },
]

const tone = { Released: 'info', 'In Escrow': 'warn', Withdrawn: 'muted' } as const

/** Biaya platform tidak dikenakan pada penarikan dana, hanya pada pemasukan. */
function feeLabel(row: Row) {
  if (row.amount < 0) return '-'
  const fee = `- ${rupiahBulat(Math.round(row.amount * PLATFORM_FEE_RATE))}`
  return row.status === 'In Escrow' ? `(Estimasi) ${fee}` : fee
}

export default function VendorKeuanganPage() {
  return (
    <>
      <VendorPageHeader
        title="Keuangan & Payout"
        description="Kelola arus kas, pantau dana yang ditahan di Escrow, dan tarik pendapatan Anda secara aman."
        action={
          <div className="max-w-[250px] rounded-lg border border-amber/70 bg-navy-900 p-4 text-white">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-amber">
              <LockIcon /> Festa Escrow Protected
            </p>
            <p className="mt-1 text-[12px] text-white/75">Dana aman hingga layanan selesai</p>
          </div>
        }
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <section className="rounded-lg border border-line border-t-4 border-t-amber bg-white p-6">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-ink/80">
            <WalletIcon className="h-5 w-5 text-amber" /> Saldo Tersedia
          </p>
          <p className="mt-4 font-display text-[38px] leading-tight font-semibold">
            {rupiahBulat(balance.available)}
          </p>
          <p className="mt-1 text-[13px] text-ink/70">Siap untuk ditarik ke rekening terdaftar.</p>

          <div className="mt-6 flex items-center gap-5 border-t border-line pt-5">
            <button
              type="button"
              className="rounded-md bg-navy-900 px-5 py-2.5 text-[13px] font-semibold text-white"
            >
              Tarik Dana
            </button>
            <button type="button" className="text-[13px] font-medium underline underline-offset-4">
              Atur Rekening
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-6">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-ink/80">
            <LockIcon /> Tertahan di Escrow
          </p>
          <p className="mt-4 font-display text-[30px] font-semibold">{rupiahBulat(balance.inEscrow)}</p>
          <p className="mt-2 text-[13px] text-ink/70">
            Dana dari {balance.escrowOrders} pemesanan aktif. Akan dirilis setelah klien
            mengonfirmasi penyelesaian.
          </p>
          <button type="button" className="mt-5 flex items-center gap-2 text-[13px] font-semibold">
            Lihat Detail Pemesanan <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <section className="rounded-lg border border-line bg-lavender/25 p-6">
          <span className="inline-block rounded-md bg-white p-2 text-navy-900">
            <InfoIcon />
          </span>
          <p className="mt-3 text-[13px] font-semibold">Informasi Biaya Platform</p>
          <p className="mt-2 text-[13px] text-ink/75">
            Biaya layanan platform sebesar <b>{PLATFORM_FEE_RATE * 100}%</b> dipotong secara otomatis
            saat dana dipindahkan dari Escrow ke Saldo Tersedia Anda.
          </p>
          <button type="button" className="mt-4 text-[13px] font-medium underline underline-offset-4">
            Baca Kebijakan Payout
          </button>
        </section>
      </div>

      <section className="mt-11">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[26px] font-semibold">Riwayat Payout & Escrow</h2>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-[13px] font-medium"
            >
              <FilterIcon /> Filter
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-[13px] font-medium"
            >
              <DownloadIcon /> Export PDF
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="bg-lavender/30 text-[13px] text-ink/70">
                <tr>
                  <th className="px-6 py-4 font-medium">ID Transaksi / Klien</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Nominal (Kotor)</th>
                  <th className="px-6 py-4 font-medium">Biaya ({PLATFORM_FEE_RATE * 100}%)</th>
                  <th className="px-6 py-4 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-6 py-5">
                      <p className="font-semibold">{r.id}</p>
                      <p className="mt-0.5 text-[13px] text-ink/70">{r.client}</p>
                    </td>
                    <td className="px-6 py-5">{r.date}</td>
                    <td className={`px-6 py-5 ${r.amount < 0 ? 'text-maroon' : ''}`}>
                      {r.amount < 0 ? `- ${rupiahBulat(-r.amount)}` : rupiahBulat(r.amount)}
                    </td>
                    <td className="px-6 py-5 text-ink/75">{feeLabel(r)}</td>
                    <td className="px-6 py-5 text-right">
                      <StatusPill tone={tone[r.status]}>{r.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="w-full border-t border-line py-4 text-[13px] font-medium text-ink/80 hover:bg-lavender/15"
          >
            Muat Lebih Banyak
          </button>
        </div>
      </section>
    </>
  )
}
