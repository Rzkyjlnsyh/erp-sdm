# Proposal Rekomendasi Infrastruktur IT & Roadmap Perbaikan Sistem ERP

**Kepada:** Pimpinan / Manajemen  
**Dari:** Tim IT Internal (Dibantu Assistant AI Google DeepMind)  
**Perihal:** Stabilitas Sistem Jangka Panjang & Efisiensi Biaya

---

## 1. Status Sistem Saat Ini (Current State)

Sistem ERP kantor saat ini sudah berjalan (Live) selama 3 minggu. Secara fungsi fitur (Absensi, Keuangan, Proyek) sudah beroperasi, namun "mesin" di belakangnya masih menggunakan infrastruktur tahap awal (Vercel Free/Pro) dan arsitektur kode yang perlu dirapikan untuk menangani ribuan data di masa depan.

## 2. Kenapa Perlu Pindah dari Vercel ke VPS (Hostinger)?

### A. Kendala Vercel (Cloud Serverless)

- **Cost Mahal saat Scale-up**: Vercel sangat bagus untuk startup awal, tapi biayanya menjadi $20/user/bulan jika kita butuh fitur Pro. Untuk tim 10 orang saja, biayanya bisa 3-4 juta/bulan.
- **Limitasi Durasi Proses**: Vercel membatasi proses maksimal 10-60 detik. Jika nanti kita butuh fitur "Rekap Laporan Bulanan PDF" yang butuh waktu proses 2 menit, di Vercel fitur ini akan _error/timeout_.

### B. Solusi VPS Hostinger (Rekomendasi)

Kami merekomendasikan migrasi ke **VPS (Virtual Private Server)**, contohnya paket **KVM 2** di Hostinger.

- **Biaya Tetap & Murah**: Sekitar **Rp 80.000 - Rp 100.000 / bulan** (Flat). Tidak peduli seberapa banyak user atau transaksi, biayanya tetap.
- **Kontrol Penuh**: Data 100% di server kita. Kita bisa install fitur berat (seperti backup otomatis tiap jam, websocket chat realtime, dll) tanpa batasan durasi.
- **Privasi Data**: Database & File perusahaan tersimpan di environment yang terisolasi khusus milik kita.

## 3. Rencana Kerja Teknis (Step-by-Step)

Agar operasional kantor tidak terganggu, perbaikan akan dilakukan bertahap tanpa mematikan sistem yang sedang jalan.

**Tahap 1: Penguatan Pondasi (Minggu Ini)**

- ✅ **Backup Database Otomatis**: Memastikan data Absensi & Keuangan aman.
- ✅ **Instalasi "Prisma ORM"**: Teknologi standar industri agar kode lebih rapi, minim bug, dan pengembangan fitur baru lebih cepat 50%.
- ✅ **Pembersihan Kode Ganda**: Menghapus kode lama yang tidak terpakai agar aplikasi lebih ringan (Faster Loading).

**Tahap 2: Persiapan Server Sendiri (Bulan Depan / Sesuai ACC)**

- Membeli paket VPS Hostinger (OS: Ubuntu 22.04).
- Setting Server (Docker, Nginx, Security Firewall).
- Percobaan Migrasi (Sistem berjalan paralel, data disinkronkan).

**Tahap 3: Full Migrasi (Weekend)**

- Memindahkan domain utama ke server baru.
- Training ulang user (jika ada perubahan tampilan minor).

## 4. Kesimpulan

Untuk jangka panjang (>6 bulan) dan jumlah data yang terus bertambah, investasi sewa VPS sendiri jauh lebih hemat dan stabil dibanding bertahan di Vercel. Tim IT siap melaksanakan migrasi ini secara bertahap tanpa mengganggu operasional harian.

---

_Dokumen ini dibuat berdasarkan analisis teknis mendalam terhadap kode sumber aplikasi ERP SDM saat ini._
