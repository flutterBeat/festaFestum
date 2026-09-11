import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { inputClass } from '../components/AuthLayout'
import { GoogleIcon } from '../components/icons'
import { post, saveAuth, type AuthResponse } from '../lib/api'

const fields = [
  { name: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'John Doe', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com', autoComplete: 'email' },
  { name: 'phone', label: 'Nomor WhatsApp', type: 'tel', placeholder: '+62 812-3456-7890', autoComplete: 'tel' },
  { name: 'password', label: 'Kata Sandi', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      const auth = await post<AuthResponse>('/auth/register', Object.fromEntries(form))
      saveAuth(auth)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      image="/img/auth-register.jpg"
      imageAlt="Rangkaian bunga di ballroom klasik"
      body="Join Festa Festum to unlock a world of high-trust event professionals and seamless planning."
    >
      <p className="font-display text-[22px] font-semibold text-navy-900">Festa Festum</p>
      <h1 className="mt-4 font-display text-[26px] font-semibold text-navy-900">Buat Akun</h1>

      {/* Backend belum punya OAuth — tombolnya sengaja mati, bukan tombol bohong. */}
      <button
        type="button"
        disabled
        title="Daftar dengan Google belum tersedia"
        className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded border border-line bg-white text-[14px] text-ink disabled:opacity-60"
      >
        <GoogleIcon />
        Sign up with Google
      </button>

      <div className="mt-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] text-muted">Or continue with</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        {fields.map((f) => (
          <div key={f.name} className="mb-4">
            <label htmlFor={f.name} className="block text-[13px] font-semibold text-navy-900">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              required
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              // Backend menolak password < 8 karakter; cegat di browser dulu.
              minLength={f.name === 'password' ? 8 : undefined}
              className={`mt-2 ${inputClass}`}
            />
          </div>
        ))}

        {error && (
          <p role="alert" className="mb-4 text-[14px] text-maroon">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 w-full rounded bg-ink text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Memproses…' : 'Daftar Sekarang'}
        </button>
      </form>

      <p className="mt-5 text-center text-[14px] text-ink">
        Already have an account?{' '}
        <Link to="/masuk" className="font-semibold hover:underline">
          Sign In
        </Link>
      </p>

      <p className="mt-5 text-center text-[12px] leading-relaxed text-muted">
        By creating an account, you agree to our <span className="underline">Syarat &amp; Ketentuan</span> and{' '}
        <span className="underline">Kebijakan Privasi</span>.
      </p>
    </AuthLayout>
  )
}
