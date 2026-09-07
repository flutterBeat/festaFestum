const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

const TOKEN_KEY = 'ff_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// ponytail: token di localStorage — cukup untuk demo lomba, tapi terbaca script
// kalau ada XSS. Upgrade-nya: backend set httpOnly cookie + cors credentials.
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)

/** POST JSON ke backend. Melempar Error berisi pesan dari server supaya
 *  form cukup menampilkan err.message apa adanya. */
export async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Tidak bisa menghubungi server. Cek koneksi Anda.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan, coba lagi.')
  return data as T
}

export type AuthResponse = {
  token: string
  user: { user_id: string; name: string; email: string; role: string }
}
