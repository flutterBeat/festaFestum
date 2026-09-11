import { useEffect, useState } from 'react'
import { VendorPageHeader, StatusPill } from '../components/VendorLayout'
import {
  ArrowRight, DownloadIcon, FilterIcon, InfoIcon, LockIcon, WalletIcon,
} from '../components/icons'
import { rupiahBulat } from '../lib/format'
import {
  getVendorBalance, listVendorBookings,
  type ApiBooking, type VendorBalance,
} from '../lib/api'

/** Arus kas vendor: saldo yang bisa ditarik, dana yang masih ditahan escrow,
 *  dan riwayat transaksinya.
 *
 *  Angkanya DITURUNKAN dari tabel payments (GET /bookings/vendor/balance),
 *  bukan disimpan sebagai kolom saldo — kolom saldo gampang melenceng dari
 *  kenyataan kalau ada satu update yang terlewat.
 *
 *  Aturannya: pembayaran sukses masih ESCROW selama acaranya belum lewat;
 *  setelah tanggal acara terlampaui, dana masuk saldo tersedia dikurangi
 *  biaya platform.
 *
 *  CATATAN: tombol "Tarik Dana" belum berfungsi. Tabel payouts dan alur
 *  approval admin belum dibuat — menunggu keputusan soal endpoint /admin.
 */



type Row = {
  id: string
  client: string
  date: string
  amount: number
  status: 'Released' | 'In Escrow' | 'Withdrawn'
}


const tone = { Released: 'info', 'In Escrow': 'warn', Withdrawn: 'muted' } as const

/** Biaya platform tidak dikenakan pada penarikan dana, hanya pada pemasukan. */
function feeLabel(row: Row) {
  if (row.amount < 0) return '-'
  const fee = `- ${rupiahBulat(Math.round(row.amount * 0.025))}`
  return row.status === 'In Escrow' ? `(Estimasi) ${fee}` : fee
}

export default function VendorKeuanganPage() {
  const [saldo, setSaldo] = useState<VendorBalance | null>(null)
  const [pesanan, setPesanan] = useState<ApiBooking[]>([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')

  useEffect(() => {
    Promise.all([getVendorBalance(), listVendorBookings()])
      .then(([a, b]) => {
        setSaldo(a.balance)
        setPesanan(b.data)
      })
      .catch((e) => setGalat(e.message))
      .finally(() => setMemuat(false))
  }, [])

  if (memuat) {
    return <p className="py-20 text-center text-[14px] text-muted">Memuat keuangan...</p>
  }
  if (galat || !saldo) {
    return (
      <p className="mt-8 border border-maroon/30 bg-maroon/5 px-5 py-4 text-[14px] text-maroon">
        {galat || 'Data keuangan tidak tersedia.'}
      </p>
    )
  }

  const balance = {
    available: saldo.saldo_tersedia,
    inEscrow: saldo.escrow,
    escrowOrders: saldo.pesanan_escrow,
  }

  // Riwayat dirakit dari pembayaran yang sudah sukses. Penarikan dana belum
  // ada barisnya karena tabel payouts belum dibuat.
  const today = new Date(new Date().toDateString())
  const history: Row[] = pesanan.flatMap((b) =>
    b.payments
      .filter((p) => p.gateway_status === 'success')
      .map((p) => ({
        id: p.payment_id.slice(0, 8).toUpperCase(),
        client: `${b.customer_name} - ${b.service_name}`,
        date: new Date(b.event_date).toLocaleDateString('id-ID', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        amount: Number(p.amount),
        status: new Date(b.event_date) < today ? 'Released' : 'In Escrow',
      }))
  )

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
              disabled={!saldo.penarikan_aktif}
              title="Penarikan dana belum tersedia — menunggu alur approval admin"
              className="rounded-md bg-navy-900 px-5 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
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
            Biaya layanan platform sebesar <b>{saldo.platform_fee_rate * 100}%</b> dipotong secara otomatis
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
                  <th className="px-6 py-4 font-medium">Biaya ({saldo.platform_fee_rate * 100}%)</th>
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
