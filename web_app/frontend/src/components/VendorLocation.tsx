import { MapPinIcon } from './icons'

/** Blok "Lokasi Vendor". Peta belum dipasang — kotak navy ini placeholder
 *  yang sama seperti di mockup. */
export default function VendorLocation() {
  return (
    <section className="border-t border-line pt-12">
      <h2 className="font-display text-[26px] font-semibold">Lokasi Vendor</h2>

      <button
        type="button"
        className="mt-6 flex h-[190px] w-full max-w-[770px] flex-col items-center justify-center gap-3 rounded-sm bg-navy-900 text-white transition-opacity hover:opacity-95"
      >
        <MapPinIcon />
        <span className="text-[15px]">Lihat Lokasi Vendor</span>
      </button>
    </section>
  )
}
