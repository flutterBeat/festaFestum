import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import FloristPage from './pages/FloristPage'
import MuaPage from './pages/MuaPage'
import AttirePage from './pages/AttirePage'
import FotograferPage from './pages/FotograferPage'
import EoPage from './pages/EoPage'
import FloristDetailPage from './pages/FloristDetailPage'
import MuaDetailPage from './pages/MuaDetailPage'
import AttireDetailPage from './pages/AttireDetailPage'
import FotograferDetailPage from './pages/FotograferDetailPage'
import EoDetailPage from './pages/EoDetailPage'
import FloristOrderPage from './pages/FloristOrderPage'
import AttireOrderPage from './pages/AttireOrderPage'
import VenueOrderPage from './pages/VenueOrderPage'
import CheckoutPage from './pages/CheckoutPage'
import VirtualAccountPage from './pages/VirtualAccountPage'
import KonfirmasiPage from './pages/KonfirmasiPage'
import PesananSayaPage from './pages/PesananSayaPage'
import FestaAiPage from './pages/FestaAiPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VendorLayout from './components/VendorLayout'
import VendorDashboardPage from './pages/VendorDashboardPage'
import VendorPemesananPage from './pages/VendorPemesananPage'
import VendorJadwalPage from './pages/VendorJadwalPage'
import VendorLayananPage from './pages/VendorLayananPage'
import VendorKeuanganPage from './pages/VendorKeuanganPage'

/** Navbar + Footer hanya untuk halaman situs. Halaman auth full-screen,
 *  jadi dia duduk di luar layout ini. */
function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/florist" element={<FloristPage />} />
          <Route path="/florist/:id" element={<FloristDetailPage />} />
          <Route path="/mua" element={<MuaPage />} />
          <Route path="/mua/:id" element={<MuaDetailPage />} />
          <Route path="/jas-kebaya" element={<AttirePage />} />
          <Route path="/jas-kebaya/:id" element={<AttireDetailPage />} />
          <Route path="/fotografer" element={<FotograferPage />} />
          <Route path="/fotografer/:id" element={<FotograferDetailPage />} />
          <Route path="/event-organizer" element={<EoPage />} />
          <Route path="/event-organizer/:id" element={<EoDetailPage />} />
          <Route path="/pesanan" element={<PesananSayaPage />} />
          <Route path="/festa-ai" element={<FestaAiPage />} />
        </Route>
        {/* Halaman pengisian pesanan punya header/footer sendiri (tanpa
            navigasi) supaya user tidak keluar alur di tengah pengisian. */}
        <Route path="/florist/:id/pesan" element={<FloristOrderPage />} />
        <Route path="/jas-kebaya/:id/pesan" element={<AttireOrderPage />} />
        <Route path="/mua/:id/pesan" element={<VenueOrderPage kind="mua" />} />
        <Route path="/fotografer/:id/pesan" element={<VenueOrderPage kind="fotografer" />} />
        <Route path="/event-organizer/:id/pesan" element={<VenueOrderPage kind="eo" />} />
        <Route path="/checkout/:bookingId" element={<CheckoutPage />} />
        <Route path="/pembayaran/:paymentId" element={<VirtualAccountPage />} />
        <Route path="/pesanan/selesai/:bookingId" element={<KonfirmasiPage />} />
        {/* Sisi vendor: sidebar sendiri, tanpa navbar/footer marketplace. */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<VendorDashboardPage />} />
          <Route path="pemesanan" element={<VendorPemesananPage />} />
          <Route path="jadwal" element={<VendorJadwalPage />} />
          <Route path="layanan" element={<VendorLayananPage />} />
          <Route path="keuangan" element={<VendorKeuanganPage />} />
        </Route>

        <Route path="/masuk" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
