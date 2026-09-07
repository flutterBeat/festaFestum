/** Shift mengikuti mockup: dua pilihan. Enum time_slot di DB punya tiga
 *  ('pagi','siang','malam') — 'siang' sengaja belum dipakai di UI.
 *  Dipakai bersama semua halaman detail vendor, jadi nilainya satu sumber. */
export const shifts = [
  { value: 'pagi', label: 'Pagi', hours: '08.00-14.00' },
  { value: 'malam', label: 'Sore/malam', hours: '15.00-22.00' },
] as const
