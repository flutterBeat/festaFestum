import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Img from '../components/Img'
import { inputClass } from '../components/AuthLayout'
import { ArrowRight, ShieldIcon } from '../components/icons'
import { categories } from '../data/categories'
import { post, saveAuth, type AuthResponse, type ApiVendor } from '../lib/api'

/** Langkah 1 onboarding vendor: bikin akun (role vendor_owner) lalu profil
 *  vendornya. Dua request berurutan karena backend memang memisahkan users
 *  dan vendors — akun dulu, profil bisnis menyusul.
 *
 *  Kategori layanan TIDAK tersimpan di sini: kolom `category` ada di tabel
 *  services, bukan vendors (keputusan desain — satu vendor boleh lintas
 *  kategori). Pilihannya dititipkan ke halaman onboarding lewat navigate
 *  state, dan di sana jadi layanan pertama vendor. */
export default function VendorRegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      const auth = await post<AuthResponse>('/auth/register', {
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
        role: 'vendor_owner',
      })
      saveAuth(auth)

      const { vendor } = await post<{ vendor: ApiVendor }>('/vendors', {
        business_name: form.get('business_name'),
      })

      // Langkah 2 (dokumen) lalu langkah 3 (profil), mengikuti urutan mockup.
      navigate('/vendor/dokumen', {
        state: { vendorId: vendor.vendor_id, category: form.get('category') },
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="relative hidden w-1/2 shrink-0 md:block">
        <Img
          src="/img/vendor-hero.jpg"
          alt="Florist menata rangkaian bunga di ballroom"
          emoji="💐"
          tint="from-rose-100 to-rose-200"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

        <div className="absolute top-10 left-10 font-display text-[32px] font-semibold text-white">
          Festa <span className="text-amber italic">Vendor</span>
        </div>

        <div className="absolute bottom-16 left-10 w-[78%] text-white">
          <h2 className="font-display text-[44px] leading-tight font-semibold">
            Kembangkan Bisnis Event Anda.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/85">
            Bergabunglah dengan ekosistem marketplace event premium pertama di Indonesia. Raih klien
            high-end dan kelola pemesanan dengan aman melalui perlindungan escrow kami.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center bg-cream px-6 py-12 md:px-14">
        <div className="mx-auto w-full max-w-[460px]">
          <h1 className="font-display text-[32px] font-semibold text-navy-900">Pendaftaran Akun</h1>
          <p className="mt-2 text-[14px] text-muted">
            Lengkapi data di bawah untuk bergabung sebagai vendor terverifikasi.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="business_name"
              className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
            >
              Nama Perusahaan
            </label>
            <input
              id="business_name"
              name="business_name"
              required
              placeholder="Misal: Elegance Florist"
              className={`mt-2 ${inputClass}`}
            />

            <label
              htmlFor="category"
              className="mt-5 block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
            >
              Kategori Layanan
            </label>
            <select id="category" name="category" required defaultValue="" className={`mt-2 ${inputClass}`}>
              <option value="" disabled>
                Pilih Kategori Utama
              </option>
              {Object.values(categories).map((c) => (
                <option key={c.apiCategory} value={c.apiCategory}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>

            <label
              htmlFor="name"
              className="mt-5 block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
            >
              Nama Penanggung Jawab
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Nama lengkap Anda"
              className={`mt-2 ${inputClass}`}
            />

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
                >
                  Email Bisnis
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="kontak@bisnis.com"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
                >
                  Nomor WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="0812-3456-7890"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
            </div>

            {/* Tidak ada di mockup, tapi akun tanpa kata sandi tidak bisa dibuat —
                backend menolak di bawah 8 karakter. */}
            <label
              htmlFor="password"
              className="mt-5 block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className={`mt-2 ${inputClass}`}
            />

            <div className="mt-6 flex gap-3 rounded border border-lavender bg-lavender/40 p-4">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <div>
                <p className="text-[12px] font-semibold tracking-wide text-navy-900 uppercase">
                  Festa Verified Vendor Program
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/80">
                  Pendaftaran ini adalah langkah awal. Tim kami akan memverifikasi portofolio dan
                  legalitas Anda untuk memastikan standar kualitas Festa Escrow Protected.
                </p>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-5 text-[14px] text-maroon">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded bg-navy-900 text-[13px] font-semibold tracking-wide text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Memproses…' : 'Daftar sebagai Vendor'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 border-t border-line pt-6 text-[14px] text-ink">
            Sudah memiliki akun vendor?{' '}
            <Link to="/vendor/masuk" className="font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
