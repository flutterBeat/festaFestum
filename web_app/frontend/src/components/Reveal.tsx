import { motion } from 'motion/react'

/** Satu bagian halaman yang muncul saat masuk layar.
 *
 *  Pakai `whileInView` dari motion — IntersectionObserver-nya diurus library,
 *  termasuk membatalkan animasi kalau elemennya keburu keluar layar.
 *
 *  `once: true` disengaja: bagian yang bergerak lagi tiap kali di-scroll
 *  balik jadi mengganggu saat halaman dibaca ulang, dan saat presentasi
 *  membuat layar terasa gelisah.
 *
 *  Gerakan dimatikan otomatis untuk pengguna yang memilih gerakan minimal —
 *  diatur sekali lewat <MotionConfig reducedMotion="user"> di App.tsx. */
export default function Reveal({
  children,
  className = '',
  /** Jeda mulai, untuk bagian yang ingin muncul berurutan. */
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}
