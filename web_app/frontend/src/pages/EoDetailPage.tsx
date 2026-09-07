import { useState } from 'react'
import { Link } from 'react-router-dom'
import Img from '../components/Img'
import BackButton from '../components/BackButton'
import { ArrowRight, MailIcon, MapPinIcon, PhoneIcon, StarIcon } from '../components/icons'
import { rupiah } from '../lib/format'

// Data contoh sesuai mockup. Diganti hasil GET /api/v1/vendors/:id begitu
// halaman ini disambungkan ke backend.
const v = {
  name: 'Nusantara Grand EO',
  badge: 'Event Organizer',
  about:
    'Merancang pengalaman acara yang tak terlupakan dengan presisi, keanggunan, dan komitmen tak tergoyahkan terhadap kesempurnaan. Dari gala perusahaan hingga perayaan intim, kami mewujudkan visi Anda.',
  hero: { src: '/img/eo-hero-nusantara.jpg', alt: 'Perencana acara menata meja jamuan' },
  rating: 4.9,
  eventsDone: '250+',
  packages: [
    {
      name: 'Paket Essential',
      priceFrom: 7500000,
      desc: 'Untuk Anda yang membutuhkan arahan profesional dalam mempersiapkan acara.',
      items: [
        'Konsultasi awal kebutuhan acara',
        'Penyusunan konsep dasar',
        'Rekomendasi vendor sesuai kebutuhan',
        'Panduan persiapan acara',
        'Evaluasi rencana sebelum pelaksanaan',
      ],
    },
    {
      name: 'Paket Premium',
      priceFrom: 21000000,
      desc: 'Pendampingan lebih lengkap untuk membantu setiap persiapan acara berjalan terarah.',
      items: [
        'Perencanaan konsep dan tema acara',
        'Penyusunan anggaran dan kebutuhan acara',
        'Koordinasi dengan vendor terpilih',
        'Penyusunan jadwal dan alur acara',
        'Pendampingan selama persiapan hingga acara berlangsung',
      ],
    },
  ],
  portfolio: {
    title: 'Gala & Acara Korporat',
    subtitle: 'Pilihan karya terbaik kami dalam mewujudkan malam yang spektakuler.',
    feature: { src: '/img/eo-gala-1.jpg', alt: 'Gala dinner di rooftop', tag: 'Annual Tech Gala 2023', caption: 'Simfoni Cahaya & Inovasi' },
    side: [
      { src: '/img/eo-gala-2.jpg', alt: 'Table setting gala' },
      { src: '/img/eo-gala-3.jpg', alt: 'Tamu berbincang di konferensi' },
    ],
  },
  contact: {
    phone: '+62 812 3456 7890',
    email: 'hello@epicureanevents.co',
    office: 'Sudirman Central Business District, Jakarta',
  },
}

const eventTypes = ['Gala Dinner', 'Konferensi', 'Perayaan Pribadi']

export default function EoDetailPage() {
  const [eventType, setEventType] = useState(eventTypes[0])

  return (
    <div className="mx-auto max-w-[1330px] px-6 pt-12 pb-20 md:px-12">
      <BackButton fallback="/event-organizer" />

      {/* HERO: teks kiri, foto kanan dengan panel statistik. */}
      <section className="mt-5 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-[38px] font-semibold">{v.name}</h1>
          <span className="mt-3 inline-block rounded-full bg-lavender px-4 py-1.5 text-[13px] text-navy-700">
            {v.badge}
          </span>
          <p className="mt-6 max-w-[480px] text-[15px] leading-[1.8] text-ink/85">{v.about}</p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#paket"
              className="inline-flex items-center gap-3 rounded-sm bg-ink px-5 py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Pilih Paket
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="#konsultasi"
              className="inline-flex items-center gap-3 rounded-sm bg-ink px-5 py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Jadwalkan Konsultasi
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="relative">
          <Img src={v.hero.src} alt={v.hero.alt} className="h-[300px] w-full object-cover md:h-[430px]" />

          <div className="absolute right-5 bottom-5 left-5 grid grid-cols-2 gap-4 bg-white/85 px-5 py-3 backdrop-blur">
            <div>
              <p className="text-[11px] text-muted">Rating Klien</p>
              <p className="mt-1 flex items-center gap-2 text-[16px] font-semibold">
                <span className="flex text-star">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon key={i} className="h-3.5 w-3.5" />
                  ))}
                </span>
                {v.rating}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted">Acara Sukses</p>
              <p className="mt-1 font-display text-[19px] font-semibold">{v.eventsDone}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PAKET */}
      <section id="paket" className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-[26px] font-semibold">Paket Perencanaan</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {v.packages.map((p) => (
            <article key={p.name} className="flex flex-col border border-line bg-white p-6">
              <h3 className="font-display text-[24px] font-semibold">{p.name}</h3>
              <p className="mt-3 text-[12px] leading-relaxed text-ink/70">{p.desc}</p>

              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[12px] leading-relaxed text-ink/85">
                {p.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>

              <div className="mt-auto border-t border-line pt-4">
                <p className="mt-4 text-[12px] text-muted">Mulai dari</p>
                <p className="font-display text-[24px] font-semibold">{rupiah(p.priceFrom)}</p>
                {/* Paket yang dipilih belum ikut terbawa ke halaman pesanan. */}
                <Link
                  to="pesan"
                  className="mt-3 inline-block rounded-sm border border-line px-4 py-1.5 text-[12px] transition-colors hover:border-navy-900 hover:text-navy-900"
                >
                  Pesan Sekarang
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PORTOFOLIO */}
      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[26px] font-semibold">{v.portfolio.title}</h2>
            <p className="mt-1 text-[13px] text-ink/70">{v.portfolio.subtitle}</p>
          </div>
          <button type="button" className="flex items-center gap-2 text-[12px] font-semibold">
            Lihat Semua Portofolio
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Img
              src={v.portfolio.feature.src}
              alt={v.portfolio.feature.alt}
              className="h-[320px] w-full object-cover md:h-[620px]"
            />
            <div className="absolute bottom-5 left-5">
              <span className="bg-black/45 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                {v.portfolio.feature.tag}
              </span>
              <p className="mt-2 font-display text-[20px] font-semibold text-white">
                {v.portfolio.feature.caption}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {v.portfolio.side.map((p) => (
              <Img key={p.src} src={p.src} alt={p.alt} className="h-[200px] w-full object-cover md:h-[304px]" />
            ))}
          </div>
        </div>
      </section>

      {/* KONSULTASI */}
      <section id="konsultasi" className="mt-16 grid gap-10 rounded-sm bg-lavender/50 p-8 md:p-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-[26px] font-semibold">Mulai Rencanakan Acara Anda</h2>
          <p className="mt-3 max-w-[400px] text-[13px] leading-relaxed text-ink/75">
            Jadwalkan konsultasi awal gratis dengan tim ahli kami. Ceritakan visi Anda, dan mari kita
            wujudkan bersama.
          </p>

          <ul className="mt-8 space-y-5 text-[13px]">
            <ContactRow icon={<PhoneIcon />} label="Telepon" value={v.contact.phone} />
            <ContactRow icon={<MailIcon />} label="Email" value={v.contact.email} />
            <ContactRow icon={<MapPinIcon className="h-4 w-4" />} label="Kantor Pusat" value={v.contact.office} />
          </ul>
        </div>

        {/* Form konsultasi belum ada endpoint-nya di backend. */}
        <form className="bg-white p-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="nama" label="Nama Lengkap" placeholder="Masukkan nama Anda" />
            <TextField id="perusahaan" label="Perusahaan (Opsional)" placeholder="Nama perusahaan" />
          </div>
          <div className="mt-4">
            <TextField id="email" label="Email" placeholder="email@contoh.com" type="email" />
          </div>

          <p className="mt-5 text-[11px] font-semibold">Jenis Acara</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {eventTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setEventType(t)}
                aria-pressed={eventType === t}
                className={`rounded-sm border px-3 py-1.5 text-[11px] transition-colors ${
                  eventType === t
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-line bg-white hover:border-navy-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <label htmlFor="pesan" className="mt-5 block text-[11px] font-semibold">
            Pesan Singkat
          </label>
          <textarea
            id="pesan"
            rows={3}
            placeholder="Ceritakan sedikit tentang rencana acara Anda..."
            className="mt-2 w-full border-b border-line bg-transparent pb-2 text-[13px] outline-none placeholder:text-ink/35 focus:border-navy-900"
          />

          <button
            type="submit"
            className="mt-6 h-11 w-full rounded-sm bg-navy-900 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Kirim Permintaan Konsultasi
          </button>
          <p className="mt-3 text-center text-[10px] text-muted">
            Informasi Anda aman dan dilindungi oleh Kebijakan Privasi kami.
          </p>
        </form>
      </section>
    </div>
  )
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-navy-900">
        {icon}
      </span>
      <span>
        <span className="block text-[11px] text-muted">{label}</span>
        <span className="font-semibold">{value}</span>
      </span>
    </li>
  )
}

function TextField({
  id,
  label,
  placeholder,
  type = 'text',
}: {
  id: string
  label: string
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full border-b border-line bg-transparent pb-1.5 text-[13px] outline-none placeholder:text-ink/35 focus:border-navy-900"
      />
    </div>
  )
}
