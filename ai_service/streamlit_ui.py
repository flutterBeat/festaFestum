# ============================================================
# FESTA FESTUM — Streamlit UI (Purwarupa Cepat)
# Mengirim form input klien ke FastAPI backend dan menampilkan
# hasil JSON dari AI secara dinamis. TIDAK membaca/upload CSV —
# UI ini murni form -> API -> render hasil.
#
# Cara jalankan:
#   pip install streamlit requests
#   streamlit run streamlit_ui.py
# ============================================================

import streamlit as st
import requests

st.set_page_config(page_title="Festa Festum — AI Event Planner", page_icon="🎉", layout="wide")

# Kategori acuan, PERSIS 5 layanan yang ada di vendors.csv. Dipakai untuk
# menyusun kartu secara konsisten walau AI cuma mengembalikan sebagian
# (kategori yang tidak tercakup budget akan tetap ditampilkan sebagai "kosong").
KATEGORI_ACUAN = [
    "Event Organizer",
    "Florist",
    "Sewa Jas/Kebaya",
    "Hair and MakeUp",
    "Fotografer",
]


def format_rupiah(angka) -> str:
    try:
        return f"Rp{int(angka):,}".replace(",", ".")
    except (TypeError, ValueError):
        return "Rp0"


# --- TAHAP 1: KONFIGURASI ENDPOINT API (di sidebar, terpisah dari form utama) ---
with st.sidebar:
    st.header("⚙️ Pengaturan API")
    api_url = st.text_input(
        "https://another-grub-blog.ngrok-free.dev",
        placeholder="https://another-grub-blog.ngrok-free.dev/api/v1/ai/recommend",
        help="Salin dari output cell FastAPI di Colab — berubah tiap server di-restart.",
    )

st.title("🎉 Festa Festum — AI Event Planner")
st.caption("Purwarupa cepat untuk demo logika kalkulasi & rekomendasi vendor AI.")

# --- TAHAP 2: FORM INPUT KLIEN (tata letak kolom dipertahankan) ---
with st.form("form_rencana_acara"):
    col1, col2, col3 = st.columns(3)
    with col1:
        event_type = st.text_input("Jenis Acara", placeholder="Contoh: Pernikahan, Ulang Tahun")
    with col2:
        location = st.text_input("Lokasi", placeholder="Contoh: Bekasi")
    with col3:
        budget = st.number_input("Budget (Rp)", min_value=0, step=100000, value=5000000)

    # Dua field ini wajib di skema EventRequest backend (guest_count, preferred_style),
    # jadi tetap ditambahkan meski tidak disebutkan eksplisit di tata letak lama.
    col4, col5 = st.columns(2)
    with col4:
        guest_count = st.number_input("Jumlah Tamu", min_value=0, step=10, value=50)
    with col5:
        gaya_raw = st.text_input("Gaya/Preferensi (pisahkan koma)", placeholder="Contoh: Elegan, Modern")

    submitted = st.form_submit_button("✨ Buat Rekomendasi", use_container_width=True)

# --- TAHAP 3: KIRIM REQUEST & TANGANI RESPONS ---
if submitted:
    if not api_url:
        st.error("Isi dulu URL endpoint FastAPI di panel kiri sebelum mengirim.")
        st.stop()
    if not event_type or not location:
        st.error("Jenis acara dan lokasi wajib diisi.")
        st.stop()

    preferred_style = [s.strip() for s in gaya_raw.split(",") if s.strip()]
    payload = {
        "event_type": event_type,
        "budget": int(budget),
        "guest_count": int(guest_count),
        "preferred_style": preferred_style,
        "location": location,
    }

    try:
        with st.spinner("AI sedang menyusun rekomendasi..."):
            resp = requests.post(api_url, json=payload, timeout=60)
        resp.raise_for_status()
        hasil = resp.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Gagal menghubungi API: {e}")
        st.stop()
    except ValueError:
        st.error("Respons API bukan JSON yang valid.")
        st.stop()

    st.session_state["hasil_rekomendasi"] = hasil
    st.session_state["budget_terkirim"] = int(budget)

# --- TAHAP 4: RENDER HASIL (dari session_state, tahan terhadap rerun kecil) ---
hasil = st.session_state.get("hasil_rekomendasi")

if hasil:
    st.divider()

    pesan_pembuka = hasil.get("pesan_pembuka", "")
    if pesan_pembuka:
        st.info(pesan_pembuka)

    rincian = hasil.get("rincian_estimasi", []) or []
    total_estimasi = hasil.get("total_estimasi", 0)
    saran = hasil.get("saran_penghematan", "")
    rekomendasi_toko = hasil.get("rekomendasi_toko", []) or []

    # --- Kartu per kategori: urut sesuai KATEGORI_ACUAN, adaptif jika sebagian hilang ---
    st.subheader("📋 Rincian Estimasi per Kategori")

    rincian_by_kategori = {item.get("kategori"): item for item in rincian}

    kartu = st.columns(len(KATEGORI_ACUAN))
    for kolom, kategori in zip(kartu, KATEGORI_ACUAN):
        item = rincian_by_kategori.pop(kategori, None)
        with kolom:
            if item:
                vendor = item.get("vendor_terpilih") or "-"
                st.metric(
                    label=kategori,
                    value=format_rupiah(item.get("harga", 0)),
                    delta=vendor,
                    delta_color="off",
                )
            else:
                st.metric(label=kategori, value="—")
                st.caption("Belum tercakup dalam estimasi ini")

    # Kategori di luar 5 acuan, jaga-jaga jika dataset berubah nanti
    if rincian_by_kategori:
        st.caption("Kategori tambahan di luar daftar acuan:")
        kartu_extra = st.columns(len(rincian_by_kategori))
        for kolom, (kategori, item) in zip(kartu_extra, rincian_by_kategori.items()):
            with kolom:
                vendor = item.get("vendor_terpilih") or "-"
                st.metric(
                    label=kategori or "Tidak diketahui",
                    value=format_rupiah(item.get("harga", 0)),
                    delta=vendor,
                    delta_color="off",
                )

    # --- Total estimasi vs budget yang dikirim ---
    st.subheader("💰 Total Estimasi")
    budget_terkirim = st.session_state.get("budget_terkirim", 0)
    sisa_budget = budget_terkirim - int(total_estimasi or 0)

    col_total, col_sisa = st.columns(2)
    with col_total:
        st.metric("Total Estimasi", format_rupiah(total_estimasi))
    with col_sisa:
        st.metric("Sisa Budget", format_rupiah(sisa_budget))

    # --- Saran penghematan dari AI ---
    if saran:
        with st.expander("💡 Saran & Catatan dari AI"):
            st.write(saran)

    # --- Rekomendasi toko, atau peringatan kalau kosong ---
    st.subheader("🏪 Vendor Direkomendasikan")
    if rekomendasi_toko:
        for nama_toko in rekomendasi_toko:
            st.write(f"- {nama_toko}")
    else:
        st.warning(
            "Tidak ada vendor yang bisa direkomendasikan untuk budget ini. "
            "Coba naikkan budget atau kurangi jumlah kategori yang diminta."
        )
