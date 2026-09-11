export const rupiah = (n: number) => `Rp ${n.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`
export const rupiahBulat = (n: number) => `Rp ${n.toLocaleString("id-ID")}`
