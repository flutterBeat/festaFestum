import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { inputClass } from '../components/AuthLayout'
import { LockIcon, MapPinIcon, ShieldIcon, UserCircleIcon } from '../components/icons'
import { get, getToken, kirim } from '../lib/api'

/** Pengaturan profil pelanggan. Semua field di sini persis kolom yang
 *  diizinkan backend di PATCH /auth/me — tidak ada yang cuma hidup di state.
 *
 *  Bagian "Rekening Bank & Pengembalian Dana" dari mockup TIDAK dibuat:
 *  tabel users tidak punya kolomnya, dan pengembalian dana memang di luar
 *  lingkup (Midtrans cuma sampai sandbox). Kalau PM tetap mau, itu perlu
 *  migrasi kolom baru dulu. */

type Profil = {
  user_id: string
  name: string
  full_name: string | null
  email: string
  phone: string | null
  birth_date: string | null
  shipping_address: string | null
  shipping_note: string | null
  notification_prefs: Record<string, boolean> | null
  role: string
  created_at: string
}

const notifikasi = [
  { key: 'pengingat_jadwal', judul: 'Pengingat Jadwal Acara (H-7 & H-1)', catatan: 'Briefing final vendor, jadwal gladi resik, dan checklist katering.' },
  { key: 'status_pembayaran', judul: 'Status Pembayaran & Tagihan Vendor', catatan: 'Pemberitahuan saat pembayaran diverifikasi atau tagihan termin diterbitkan.' },
  { key: 'chat_vendor', judul: 'Chat Langsung dari Vendor Resmi', catatan: 'Pesan instan via WhatsApp dari fotografer & wedding organizer.' },
  { key: 'promo_ai', judul: 'Promo & Rekomendasi Vendor AI', catatan: 'Penawaran kurasi musiman dari vendor wedding & corporate.' },
]

const bulanId = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export default function ProfilPage() {
  const masuk = Boolean(getToken())

  const [profil, setProfil] = useState<Profil | null>(null)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!masuk) return
    get<{ user: Profil }>('/auth/me')
      .then(({ user }) => {
        setProfil(user)
        setPrefs(user.notification_prefs ?? {})
      })
      .catch((err) => setError((err as Error).message))
  }, [masuk])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPesan('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      const { user } = await kirim<{ user: Profil }>('/auth/me', 'PATCH', {
        full_name: form.get('full_name'),
        name: form.get('name'),
        phone: form.get('phone'),
        birth_date: form.get('birth_date') || '',
        shipping_address: form.get('shipping_address'),
        shipping_note: form.get('shipping_note'),
        notification_prefs: prefs,
      })
      setProfil(user)
      setPesan('Perubahan tersimpan.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!masuk) {
    return (
      <div className="mx-auto max-w-[1330px] px-6 pt-12 pb-20 md:px-12">
        <div className="mx-auto mt-10 max-w-[520px] rounded-sm border border-line bg-white px-8 py-12 text-center">
          <h1 className="font-display text-[30px] font-semibold">Masuk dulu, ya</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
            Halaman profil berisi data pribadi yang terikat ke akun Anda — alamat pengiriman,
            kontak, dan preferensi pemberitahuan.
          </p>
          <Link
            to="/masuk"
            className="mt-7 inline-flex h-11 items-center rounded bg-navy-900 px-8 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Masuk
          </Link>
        </div>
      </div>
    )
  }

  if (!profil) {
    return (
      <div className="mx-auto max-w-[1330px] px-6 py-20 md:px-12">
        <p className="text-[15px] text-muted">{error || 'Memuat profil…'}</p>
      </div>
    )
  }

  const bergabung = new Date(profil.created_at)
  const inisial = (profil.name || profil.email).slice(0, 1).toUpperCase()

  return (
    <div className="mx-auto max-w-[1330px] px-6 pt-10 pb-20 md:px-12">
      <p className="text-[12px] tracking-wide text-muted uppercase">
        Akun Pengguna <span className="mx-2">›</span>
        <span className="font-semibold text-navy-900">Pengaturan Profil</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-lg border border-line bg-white p-6 text-center">
          <div className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-full bg-lavender font-display text-[34px] font-semibold text-navy-900">
            {inisial}
          </div>
          <p className="mt-4 font-display text-[20px] font-semibold text-navy-900">
            {profil.full_name || profil.name}
          </p>
          <p className="mt-1 text-[13px] text-muted">{profil.email}</p>

          <p className="mt-5 border-t border-line pt-4 text-[13px] text-muted">
            Bergabung{' '}
            <span className="font-semibold text-navy-900">
              {bulanId[bergabung.getMonth()]} {bergabung.getFullYear()}
            </span>
          </p>

          <div className="mt-6 flex gap-3 rounded border border-lavender bg-lavender/40 p-4 text-left">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <div>
              <p className="text-[13px] font-semibold text-navy-900">Jaminan Layanan Resmi</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink/75">
                Setiap transaksi Anda dilindungi perjanjian kemitraan dengan vendor terverifikasi.
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-line bg-white p-7">
            <h1 className="font-display text-[26px] font-semibold text-navy-900">
              Informasi Pribadi &amp; Biodata
            </h1>
            <p className="mt-2 text-[14px] text-muted">
              Kelola identitas resmi Anda untuk kontrak vendor, konfirmasi acara, dan transaksi
              pemesanan.
            </p>

            <h2 className="mt-7 flex items-center gap-2 text-[17px] font-semibold text-navy-900">
              <UserCircleIcon className="h-5 w-5 text-amber" />
              Biodata &amp; Verifikasi Kontak
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
                  Nama Lengkap (sesuai KTP)
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  defaultValue={profil.full_name ?? ''}
                  className={`mt-2 ${inputClass}`}
                />
                <p className="mt-1 text-[12px] text-muted">Dipakai di kontrak resmi vendor.</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
                  Nama Panggilan / Display
                </label>
                <input id="name" name="name" required defaultValue={profil.name} className={`mt-2 ${inputClass}`} />
                <p className="mt-1 text-[12px] text-muted">Ditampilkan di pesanan dan navbar.</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
                  Alamat Email Utama
                </label>
                <div className="relative mt-2">
                  <input
                    id="email"
                    value={profil.email}
                    readOnly
                    className={`${inputClass} cursor-not-allowed bg-cream pr-10`}
                  />
                  <LockIcon className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink/40" />
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Email dipakai untuk masuk, jadi belum bisa diubah sendiri.
                </p>
              </div>

              <div>
                <label htmlFor="birth_date" className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
                  Tanggal Lahir
                </label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  defaultValue={profil.birth_date?.slice(0, 10) ?? ''}
                  className={`mt-2 ${inputClass}`}
                />
              </div>
            </div>

            <div className="mt-6 rounded border border-lavender bg-lavender/40 p-5">
              <p className="text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
                Nomor WhatsApp Resmi
              </p>
              <p className="mt-1 text-[13px] text-ink/80">
                Digunakan untuk konfirmasi darurat hari H dan verifikasi keamanan pemesanan.
              </p>
              <input
                name="phone"
                type="tel"
                required
                defaultValue={profil.phone ?? ''}
                placeholder="0812-3456-7890"
                className={`mt-3 ${inputClass}`}
              />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-7">
            <h2 className="flex items-center gap-2 text-[17px] font-semibold text-navy-900">
              <MapPinIcon className="h-5 w-5 text-amber" />
              Alamat Pengiriman &amp; Fitting
            </h2>
            <p className="mt-2 text-[14px] text-muted">
              Lokasi kurir untuk pengiriman mockup dekor, buket bunga, suvenir, serta jadwal fitting
              desainer.
            </p>

            <label htmlFor="shipping_address" className="mt-5 block text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
              Alamat Lengkap
            </label>
            <textarea
              id="shipping_address"
              name="shipping_address"
              rows={3}
              defaultValue={profil.shipping_address ?? ''}
              placeholder="Nama gedung, jalan, kelurahan, kota, kode pos"
              className="mt-2 w-full rounded border border-line bg-cream px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink/35 focus:border-navy-900"
            />

            <label htmlFor="shipping_note" className="mt-5 block text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
              Patokan / Catatan Kurir
            </label>
            <input
              id="shipping_note"
              name="shipping_note"
              defaultValue={profil.shipping_note ?? ''}
              placeholder="Misal: titipkan ke concierge lobi utara"
              className={`mt-2 ${inputClass}`}
            />
          </section>

          <section className="rounded-lg border border-line bg-white p-7">
            <h2 className="text-[17px] font-semibold text-navy-900">
              Preferensi Notifikasi &amp; Peringatan Acara
            </h2>
            <p className="mt-2 text-[14px] text-muted">
              Kendalikan bagaimana kami dan para mitra vendor menghubungi Anda.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {notifikasi.map((n) => (
                <label
                  key={n.key}
                  htmlFor={n.key}
                  className="flex cursor-pointer gap-3 rounded border border-line bg-cream p-4"
                >
                  <input
                    id={n.key}
                    type="checkbox"
                    checked={prefs[n.key] ?? false}
                    onChange={(e) => setPrefs((p) => ({ ...p, [n.key]: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-navy-900"
                  />
                  <span>
                    <span className="block text-[14px] font-semibold text-navy-900">{n.judul}</span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-muted">{n.catatan}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {error && (
            <p role="alert" className="text-[14px] text-maroon">
              {error}
            </p>
          )}
          {pesan && <p className="text-[14px] font-semibold text-[#2e6b52]">{pesan}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded bg-amber px-8 text-[15px] font-semibold text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Menyimpan…' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
