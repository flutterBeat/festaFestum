import { useNavigate } from 'react-router-dom'
import { ArrowRight } from './icons'

/** Kembali ke halaman sebelumnya. Kalau detail dibuka langsung dari URL
 *  (tidak ada riwayat), jatuh ke halaman kategori yang diberikan. */
export default function BackButton({ fallback }: { fallback: string }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(fallback))}
      className="inline-flex items-center gap-2 text-[14px] text-navy-900/80 transition-colors hover:text-navy-900"
    >
      <ArrowRight className="h-4 w-4 rotate-180" />
      Kembali
    </button>
  )
}
