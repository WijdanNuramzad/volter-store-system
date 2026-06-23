# ⚡ Volter Community Management System

Sistem Informasi Manajemen terpadu yang dirancang khusus untuk mendukung operasional **Volter Community**, sebuah komunitas kreatif di ekosistem Roblox. Sistem ini memfasilitasi pengelolaan pesanan jasa (map/script), sistem antrian transparan, komunikasi _real-time_, dan distribusi aset digital.

## 👥 Tim Pengembang (Proyek Konsultansi)

- **Yudistira Abdul Aziz** (20230201048)
- **Wijdan Nuramzad** (20230201039)
- **Muhamad Sidik** (20230201032)
- **Muhammad Faiz Alghifari** (20230201051)
- **Yuda Taufik Hidayat** (20230201046)

**Dosen Pembimbing:** Dede Rizal Nursamsi, S.T., M.Kom.
**Program Studi:** Sistem Informasi - Universitas Cipasung (2026)

---

## 🏗️ Arsitektur & Teknologi (Tech Stack)

Sistem ini menggunakan arsitektur **API-Driven** ("Satu Otak, Dua Wajah") dengan pendekatan _Separation of Concerns_.

- **Backend & API:** Node.js / PHP Laravel
- **Database:** MySQL / PostgreSQL
- **Frontend Web (Admin & Etalase Publik):** React JS
- **Frontend Mobile (Aplikasi Customer):** Flutter (Dart)
- **Real-time Engine:** Socket.IO (Chat) & Firebase Cloud Messaging (Notifikasi)

---

## 📂 Struktur Repositori (Monorepo)

```text
Volter-Community-System/
│
├── docs/                 # Dokumen proyek (Laporan, ERD, Wireframe)
├── backend_api/          # Logika server, REST API, dan database models
├── frontend_web/         # Source code Web Dashboard Admin (React JS)
└── frontend_mobile/      # Source code Aplikasi Mobile Customer (Flutter)
```

---

## 🎨 Panduan Desain Visual (UI/UX)

Mengusung tema **Dark Slate & Cyber Cyan** (_Gamer Aesthetic_) untuk memberikan kesan premium, modern, dan nyaman di mata (Mode Gelap).

**Palet Warna:**

- `Background Utama`: `#0F172A` (Deep Slate - Abu-abu gelap kebiruan)
- `Background Elemen`: `#1E293B` (Slate Surface - Untuk form, card, chat bubble)
- `Aksen Utama`: `#00F0FF` (Cyber Cyan - Untuk tombol aksi utama & status aktif)
- `Aksen Sekunder`: `#8B5CF6` (Electric Purple - Detail premium/badge)

**Tipografi:**

- `Heading/Judul`: **Poppins** (Kesan modern & berani)
- `Body/Deskripsi`: **Inter** (Keterbacaan optimal di layar kecil)

---

## 🗄️ Struktur Database Utama (ERD)

Sistem relasional dibagi menjadi 3 kelompok data utama:

### 1. Master Data

- `users`: Data otentikasi admin & pelanggan (id, nama, roblox_username, role).
- `assets`: Katalog digital untuk toko (id, nama, harga, file_url, is_free).
- `portfolio`: Etalase karya komunitas yang sudah selesai.

### 2. Transaksi & Operasional

- `orders`: Transaksi pemesanan jasa (id, user_id, kategori_jasa, harga, status).
- `payments`: Data pembayaran (id, order_id, bukti_transfer, status_verifikasi).
- `antrian`: Manajemen urutan pengerjaan (id, order_id, posisi, status).

### 3. Interaksi & Komunikasi

- `chat_messages`: Obrolan _real-time_ per-order (id, order_id, sender_id, pesan).
- `testimonials`: Ulasan pasca-pengerjaan (id, user_id, rating, komentar).
- `notifications`: Riwayat pemberitahuan sistem ke pengguna.

Proyek ini belum selesai dan masih dalam tahap pengembangan
tata ulang UI dan juga perapihan logika
menambahkan fitur yang tidak ada dan memperbaiki fitur yg kurang lengkap
