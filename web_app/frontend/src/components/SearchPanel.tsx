import { SearchIcon, ChevronDown } from './icons'

type SelectField = {
  kind: 'select'
  label: string
  options: string[]
}

type DateField = {
  kind: 'date'
  label: string
  placeholder: string
}

export type Field = SelectField | DateField

/** Panel pencarian putih yang menumpuk di atas hero.
 *  Dipakai landing page (Tanggal/Lokasi/Vendor) dan halaman kategori
 *  (Lokasi/Harga/Jenis) — isinya beda, bingkainya sama. */
export default function SearchPanel({ fields }: { fields: Field[] }) {
  return (
    <div className="bg-white px-6 py-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] md:px-8 md:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        {fields.map((f) => (
          <div key={f.label} className="flex-1">
            <label className="mb-2 block text-[14px] text-ink/80">{f.label}</label>

            {f.kind === 'date' ? (
              <input
                type="date"
                aria-label={f.label}
                className="h-11 w-full rounded border border-line bg-white px-3 text-[14px] text-ink/70 outline-none focus:border-navy-900"
              />
            ) : (
              <div className="relative">
                <select
                  aria-label={f.label}
                  className="h-11 w-full appearance-none rounded border border-line bg-white px-3 pr-9 text-[14px] text-ink/80 outline-none focus:border-navy-900"
                >
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2.5 rounded bg-navy-900 px-10 text-[15px] font-medium text-white transition-opacity hover:opacity-90 md:w-[180px]"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
          Cari
        </button>
      </div>
    </div>
  )
}
