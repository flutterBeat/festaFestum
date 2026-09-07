import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/festa-ai', label: 'Festa AI' },
  { to: '/pesanan', label: 'Pesanan Saya' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-6 md:px-12">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight md:text-[28px]">
          Festa Festum
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `pb-1 text-[15px] transition-colors ${
                  isActive
                    ? 'border-b-2 border-ink font-medium text-ink'
                    : 'border-b-2 border-transparent text-ink/80 hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Akun saya"
          className="h-9 w-9 rounded-full bg-stone-300 transition-colors hover:bg-stone-400"
        />
      </div>
    </header>
  )
}
