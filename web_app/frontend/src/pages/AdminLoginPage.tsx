import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, ShieldIcon } from '../components/icons'
import { post, saveAuth, clearAuth, type AuthResponse } from '../lib/api'

/** Masuk ke Pusat Kendali admin. Tidak ada mockup-nya, jadi gayanya
 *  mengikuti sidebar gelap di keempat halaman admin.
 *
 *  SENGAJA TIDAK ADA PENDAFTARAN: akun admin dibuat langsung di database.
 *  Backend juga menutup jalurnya — POST /auth/register hanya menerima
 *  'customer' dan 'vendor_owner' (ALLOWED_SELF_REGISTER_ROLES), peran lain
 *  diturunkan jadi customer. Jadi tidak ada cara mendaftar jadi admin
 *  lewat API, dan halaman ini tidak perlu menutup celah apa pun. */
export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [lihatSandi, setLihatSandi] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      const auth = await post<AuthResponse>('/auth/login', {
        email: form.get('email'),
        password: form.get('password'),
      })

      // Penjaga di browser cuma soal pengalaman; endpoint /admin/* tetap
      // dijaga requireRole('admin') di backend.
      if (auth.user.role !== 'admin') {
        clearAuth()
        setError('Akun ini tidak punya akses Pusat Kendali.')
        return
      }

      saveAuth(auth)
      navigate('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 font-display text-[20px] font-semibold text-amber">
            F.
          </span>
          <span>
            <span className="block font-display text-[24px] leading-none font-semibold text-white">
              Festa Festum
            </span>
            <span className="mt-1 block text-[11px] tracking-[0.18em] text-amber uppercase">
              Pusat Kendali
            </span>
          </span>
        </div>

        <div className="mt-7 rounded-lg bg-white px-8 py-9">
          <h1 className="font-display text-[26px] font-semibold text-navy-900">Masuk Pusat Kendali</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Konsol internal untuk kurasi vendor, rekening bersama, dan registri akun.
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            <label
              htmlFor="email"
              className="block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
            >
              Email Admin
            </label>
            <div className="relative mt-2">
              <MailIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@festafestum.id"
                className="h-11 w-full rounded border border-line bg-white pr-4 pl-10 text-[14px] text-ink outline-none placeholder:text-ink/35 focus:border-navy-900"
              />
            </div>

            <label
              htmlFor="password"
              className="mt-5 block text-[12px] font-semibold tracking-wide text-navy-900 uppercase"
            >
              Kata Sandi
            </label>
            <div className="relative mt-2">
              <LockIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                id="password"
                name="password"
                type={lihatSandi ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 w-full rounded border border-line bg-white pr-11 pl-10 text-[14px] text-ink outline-none placeholder:text-ink/35 focus:border-navy-900"
              />
              <button
                type="button"
                onClick={() => setLihatSandi((v) => !v)}
                aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-ink/45"
              >
                {lihatSandi ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-5 text-[14px] text-maroon">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 h-12 w-full rounded bg-navy-900 text-[13px] font-semibold tracking-wide text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Memeriksa…' : 'Masuk Pusat Kendali'}
            </button>
          </form>

          <p className="mt-7 flex gap-2 border-t border-line pt-5 text-[12px] leading-relaxed text-muted">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            Akun Pusat Kendali dibuat langsung oleh tim internal — tidak ada pendaftaran mandiri.
          </p>
        </div>

        <p className="mt-8 text-center text-[12px] text-white/40">
          © 2026 Festa Festum. Secure Escrow Protected.
        </p>
      </div>
    </div>
  )
}
