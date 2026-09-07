import { Link } from 'react-router-dom'
import Img from '../components/Img'
import SearchPanel, { type Field } from '../components/SearchPanel'
import AiBanner from '../components/AiBanner'
import { StarIcon, ArrowRight } from '../components/icons'

const searchFields: Field[] = [
  { kind: 'date', label: 'Tanggal', placeholder: 'Pilih Tanggal' },
  { kind: 'select', label: 'Lokasi', options: ['Jakarta Pusat', 'Jakarta Selatan','Jakarta Timur','Jakarta Barat','Tanggerang','Bekasi', 'Depok', 'Bogor'] },
  {
    kind: 'select',
    label: 'Vendor',
    options: ['Pilih Vendor', 'MUA', 'Fotografer', 'Florist', 'Jas & Kebaya', 'Event Organizer'],
  },
]

const kategori = [
  { label: 'MUA', image: '/img/kategori-mua.png', to: '/mua' },
  { label: 'Jas & Kebaya', image: '/img/kategori-attire.png', to: '/jas-kebaya' },
  { label: 'Florist', image: '/img/kategori-florist.png', to: '/florist' },
  { label: 'Fotografer', image: '/img/kategori-fotografer.png', to: '/fotografer' },
  { label: 'Event Organizer', image: '/img/kategori-eo.png', to: '/event-organizer' },
]

const langkah = [
  {
    no: '01',
    title: 'Tentukan Kebutuhan',
    body: 'Pilih tanggal, lokasi, dan layanan yang Anda butuhkan.',
  },
  {
    no: '02',
    title: 'Temukan Vendor',
    body: 'Jelajahi berbagai vendor sesuai kebutuhan acara Anda.',
  },
  {
    no: '03',
    title: 'Rencanakan dengan Festa AI',
    body: 'Dapatkan bantuan untuk menyusun kebutuhan dan koordinasi acara.',
  },
]

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[560px] overflow-hidden md:h-[720px]">
          <Img
            src="/img/hero-landing.png"
            alt="Dekorasi acara formal"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <h1 className="max-w-[900px] font-display text-4xl font-bold text-white drop-shadow-sm md:text-[46px]">
              Wujudkan Acara Formal Anda dengan Lebih Mudah
            </h1>
            <p className="mt-4 max-w-[640px] font-display text-lg text-white/95 md:text-[19px]">
              Temukan vendor terbaik untuk kebutuhan acara Anda, mulai dari MUA, fotografer,
              florist, sewa jas &amp; kebaya, hingga Event Organizer.
            </p>
          </div>
        </div>

        {/* Panel duduk di batas bawah foto, menindih tipis saja. */}
        <div className="relative z-10 mx-auto -mt-3 max-w-[1290px] px-6 md:px-12">
          <SearchPanel fields={searchFields} />
        </div>
      </section>

      {/* KATEGORI */}
      <section className="mx-auto max-w-[1290px] px-6 pt-14 md:px-12">
        <h2 className="font-display text-[26px] font-semibold">
          Temukan Vendor Sesuai Kebutuhan Anda
        </h2>
        <p className="mt-2 text-[13px] text-muted">
          Berbagai pilihan layanan untuk membantu mempersiapkan acara formal Anda.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {kategori.map((k) => (
            <Link key={k.label} to={k.to} className="group block">
              <Img
                src={k.image}
                alt={k.label}
                className="h-[240px] w-full object-cover transition-opacity group-hover:opacity-90"
              />
              <span className="sr-only">{k.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* REKOMENDASI */}
      <section className="mx-auto max-w-[1290px] px-6 pt-24 md:px-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-[30px] font-semibold">Rekomendasi Vendor</h2>
            <p className="mt-2 text-[14px] text-muted">Pilihan terbaik untuk acara pentingmu</p>
          </div>
          <button type="button" aria-label="Lihat semua rekomendasi" className="text-ink">
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          {/* Kartu besar */}
          <article className="flex flex-col border border-line bg-white">
            <Img
              src="/img/vendor-epicurean.png"
              alt="Epicurean Event & Co"
              className="h-[290px] w-full object-cover"
            />
            <div className="flex flex-1 flex-col px-7 py-7">
              <h3 className="font-display text-[30px] font-semibold">Epicurean Event &amp; Co</h3>
              <div className="mt-3 flex items-center gap-4">
                <span className="rounded-sm bg-maroon px-3 py-1 text-[11px] font-medium text-white">
                  Event Organizer
                </span>
                <span className="flex items-center gap-1 text-[12px] text-ink/80">
                  <StarIcon className="h-3.5 w-3.5 text-star" />
                  4.9 (130 ulasan)
                </span>
              </div>
              <button
                type="button"
                className="mt-auto w-full rounded-sm bg-navy-900 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Lihat Detail
              </button>
            </div>
          </article>

          {/* Dua kartu kecil */}
          <div className="grid gap-6">
            {[
              {
                name: 'Botanica Florist',
                city: 'Jakarta Selatan',
                image: '/img/vendor-botanica.png',
              },
              { name: 'Aura Glow Artist', city: 'Depok', image: '/img/vendor-aura.png' },
            ].map((v) => (
              <article key={v.name} className="flex flex-col border border-line bg-white">
                <Img src={v.image} alt={v.name} className="h-[150px] w-full object-cover" />
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-[23px] font-semibold">{v.name}</h3>
                    <span className="pt-1.5 text-[11px] font-semibold">{v.city}</span>
                  </div>
                  <span className="mt-1 flex items-center gap-1 text-[12px] text-ink/80">
                    <StarIcon className="h-3.5 w-3.5 text-star" />
                    4.9 (130 ulasan)
                  </span>
                  <button
                    type="button"
                    className="mt-4 rounded-sm border border-line px-4 py-1.5 text-[12px] transition-colors hover:border-navy-900"
                  >
                    Lihat Profil
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3 LANGKAH */}
      <section className="mx-auto max-w-[1290px] px-6 pt-24 md:px-12">
        <div className="bg-lavender px-8 py-14 md:px-16">
          <h2 className="text-center font-display text-[26px] font-semibold">
            Rencanakan Acara dalam 3 Langkah
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {langkah.map((l) => (
              <div key={l.no} className="flex flex-col items-center text-center">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-sm bg-navy-900 font-display text-[19px] font-semibold text-white">
                  {l.no}
                </div>
                <h3 className="mt-5 font-display text-[16px] font-semibold">{l.title}</h3>
                <p className="mt-2 max-w-[230px] text-[12px] leading-relaxed text-muted">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-24">
        <AiBanner
          body="Jelaskan visi Anda dalam bahasa sehari-hari. AI kami akan menyusun jadwal terkoordinasi lengkap dan mengusulkan vendor papan atas yang tersedia secara instan."
          cta="Mulai Menyusun"
        />
      </div>
    </>
  )
}
