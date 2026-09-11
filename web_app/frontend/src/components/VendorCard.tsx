import { Link } from 'react-router-dom'
import Img from './Img'
import { StarIcon } from './icons'
import { rupiahBulat } from '../lib/format'

export type Vendor = {
  id: string
  name: string
  city: string
  rating: number
  ratingCount: number
  priceFrom: number
  /** Kosongkan selama foto vendor belum ada — emoji kategori yang dipakai. */
  image?: string
  emoji?: string
  tint?: string
}

/** Kartu vendor di grid halaman kategori. */
export default function VendorCard({ vendor, to }: { vendor: Vendor; to: string }) {
  return (
    <article className="flex flex-col border border-line bg-white">
      <Img
        src={vendor.image}
        alt={vendor.name}
        emoji={vendor.emoji}
        tint={vendor.tint}
        className="h-[210px] w-full object-cover"
      />

      <div className="px-5 pt-4 pb-4">
        <h3 className="font-display text-[22px] font-semibold">{vendor.name}</h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[12px] text-muted">{vendor.city}</span>
          {/* rating_count masih 0 untuk vendor hasil seed — dataset cuma punya
              rata-ratanya, belum ada tabel reviews yang terisi. */}
          <span className="flex items-center gap-1 text-[12px] text-ink/80">
            <StarIcon className="h-3.5 w-3.5 text-star" />
            {vendor.rating}
            {vendor.ratingCount > 0 && ` (${vendor.ratingCount} ulasan)`}
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-line px-5 py-4">
        <div>
          <p className="text-[12px] text-muted">Mulai dari</p>
          <p className="font-display text-[21px] font-semibold">{rupiahBulat(vendor.priceFrom)}</p>
        </div>
        <Link
          to={to}
          className="rounded-sm border border-line px-4 py-1.5 text-[12px] transition-colors hover:border-navy-900 hover:text-navy-900"
        >
          Lihat Profil
        </Link>
      </div>
    </article>
  )
}
