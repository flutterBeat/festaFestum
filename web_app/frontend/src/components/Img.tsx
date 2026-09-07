import { useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
}

/** Gambar dari /public/img. Kalau filenya belum ada, tampilkan blok netral
 *  supaya layout tetap terbaca dan tidak muncul ikon "broken image". */
export default function Img({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-stone-200 to-stone-300 ${className}`}
        role="img"
        aria-label={alt}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
