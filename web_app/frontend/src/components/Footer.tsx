import { Link } from 'react-router-dom'
import { MailIcon, InstagramIcon } from './icons'

const navigasi = ['Beranda', 'Festa AI', 'Pesanan Saya']
const layanan = [
  { label: 'MUA', to: '/mua' },
  { label: 'Fotografer', to: '/fotografer' },
  { label: 'Florist', to: '/florist' },
  { label: 'Jas & Kebaya', to: '/jas-kebaya' },
  { label: 'Event Organizer', to: '/event-organizer' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white/70">
      <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="max-w-[240px]">
            <h3 className="font-display text-xl font-semibold text-white">Festa Festum</h3>
            <p className="mt-4 text-[13px] leading-relaxed text-white/50">
              Festa Festum — Temukan kebutuhan acara formal Anda dalam satu tempat.
            </p>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-white">Navigasi</h4>
            <ul className="mt-4 space-y-3 text-[13px]">
              {navigasi.map((n) => (
                <li key={n}>
                  <Link to="/" className="transition-colors hover:text-white">
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-white">Layanan</h4>
            <ul className="mt-4 space-y-3 text-[13px]">
              {layanan.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-white">Kontak</h4>
            <ul className="mt-4 space-y-3 text-[13px]">
              <li className="flex items-center gap-2">
                <MailIcon /> Email
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon /> Instagram
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-[12px] text-white/40">
          © 2026 Festa Festum. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
