import { Link, Navigate } from 'react-router-dom'
import { LockIcon } from './icons'
import { clearAuth, getToken, getUser } from '../lib/api'

/** Penjaga akses untuk layout dashboard (admin & vendor).
 *
 *  Dipusatkan karena dua layout memakai aturan yang sama persis, dan kartu
 *  penolakannya belasan baris — menyalinnya dua kali berarti nanti ada satu
 *  yang lupa ikut diperbaiki.
 *
 *  INI PENJAGA TAMPILAN, BUKAN KEAMANAN. Otorisasi sebenarnya di backend
 *  (`requireRole` di middleware/authMiddleware.js), yang tetap membalas
 *  401/403 walau isi localStorage dipalsukan lewat DevTools. Gunanya di sini
 *  supaya tamu tidak melihat kerangka dashboard kosong yang semua datanya
 *  gagal dimuat.
 *
 *  Pakainya di awal komponen layout:
 *    const tolak = cekAkses('admin', '/admin/masuk')
 *    if (tolak) return tolak
 */
export function cekAkses(peran: 'admin' | 'vendor_owner', masukKe: string) {
  const user = getUser()

  // Belum masuk sama sekali -> ke halaman masuk, tanpa kedipan dashboard.
  // `replace` supaya tombol Kembali tidak memantul balik ke sini.
  if (!getToken()) return <Navigate to={masukKe} replace />

  // Sudah masuk tapi salah peran -> jangan diam-diam dilempar ke form masuk,
  // karena itu terbaca seperti aplikasi rusak. Jelaskan penolakannya.
  if (user?.role !== peran) {
    const nama = peran === 'admin' ? 'Pusat Kendali' : 'Workspace Vendor'
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
        <div className="w-full max-w-[440px] rounded-lg bg-white px-8 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-maroon/10 text-maroon">
            <LockIcon className="h-5 w-5" />
          </span>
          <p className="mt-5 text-[12px] font-semibold tracking-wide text-maroon uppercase">
            403 — Akses ditolak
          </p>
          <h1 className="mt-2 font-display text-[26px] font-semibold text-navy-900">
            Bukan akun {nama}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Akun <b>{user?.email ?? 'ini'}</b> tidak punya akses {nama}. Masuk dengan akun yang
            sesuai, atau kembali ke halaman utama.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to={masukKe}
              onClick={clearAuth}
              className="flex h-11 items-center rounded bg-navy-900 px-6 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Masuk ke {nama}
            </Link>
            <Link
              to="/"
              className="flex h-11 items-center rounded border border-line px-6 text-[14px] font-semibold text-ink/80"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
