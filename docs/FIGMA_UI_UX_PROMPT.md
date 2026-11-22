# Prompt AI Agent Figma
## Ratu Kriuk — Sistem Pencatatan Pesanan Terpadu

Gunakan prompt ini pada AI agent Figma untuk menghasilkan desain UI/UX yang konsisten dengan PRD dan dokumen UML proyek.

---

## PROMPT UTAMA

Anda berperan sebagai **Senior Product Designer, UX Architect, dan Figma Design Systems Specialist**. Buat desain UI/UX high-fidelity untuk aplikasi web internal bernama **“Ratu Kriuk — Sistem Pencatatan Pesanan Terpadu”**.

### 1. Konteks Produk

Aplikasi ini digunakan oleh usaha Ratu Kriuk untuk:
- Mengelola data produk dan pelanggan.
- Mencatat pesanan pelanggan secara manual.
- Mengimpor pesanan marketplace melalui file ekspor.
- Menghitung total produk, ongkos kirim, dan total pembayaran.
- Memantau dan memperbarui status pesanan.
- Menampilkan daftar pesanan yang perlu dikemas.
- Menandai pesanan sebagai Dikemas.
- Mencatat hasil produksi sebagai batch baru.

Ada dua role:
1. **Admin/Owner**: dashboard, produk, pelanggan, pesanan manual, impor marketplace, ubah status, pantau produksi.
2. **Pegawai**: dashboard operasional, daftar packing, detail pesanan untuk packing, tandai dikemas, dan catat hasil produksi jika bertugas di bagian produksi.

Jangan menambahkan fitur yang tidak disebutkan sebagai kebutuhan inti, seperti pembayaran online, pelacakan kurir real-time, integrasi API marketplace, inventaris bahan baku, atau portal pelanggan.

### 2. Arah Visual

Buat antarmuka yang:
- Modern, bersih, profesional, hangat, dan mudah digunakan untuk operasional harian.
- Memiliki identitas visual yang terinspirasi dari produk makanan ringan/crispy snack tanpa terlihat kekanak-kanakan.
- Menggunakan warna dasar netral hangat (off-white/ivory), teks charcoal, dan aksen oranye/amber atau terracotta yang terukur.
- Menggunakan warna status yang konsisten dan mudah dibedakan.
- Mengutamakan keterbacaan tabel, angka, form, dan status.
- Tidak memakai glassmorphism berlebihan, gradient mencolok, dekorasi berlebihan, atau layout landing page marketing.
- Menggunakan whitespace yang cukup, radius konsisten, border halus, dan shadow ringan.
- Menggunakan ikon sederhana dan konsisten (outline style).
- Mengutamakan aksesibilitas: kontras memadai, ukuran teks nyaman, status tidak dibedakan hanya dengan warna.

### 3. Target Platform dan Grid

- Desktop-first web application, dirancang pada frame utama **1440 × 1024 px**.
- Buat versi tablet sekitar **1024 px** dan mobile sekitar **390 px** untuk halaman penting.
- Gunakan grid 12 kolom pada desktop.
- Sidebar kiri tetap untuk navigasi utama, topbar untuk judul halaman, breadcrumb seperlunya, dan area konten utama.
- Sidebar dapat collapse pada layar lebih kecil.
- Gunakan spacing system berbasis 4/8 px.
- Buat komponen reusable dan variants, bukan mendesain setiap halaman secara terpisah.

### 4. Design System yang Harus Dibuat

Buat satu page khusus bernama **“00 — Design System”** yang berisi:
- Color styles/tokens: primary, secondary, accent, background, surface, border, text, success, warning, danger, info, disabled.
- Typography scale: display, H1/H2/H3, body, body-small, label, caption, table.
- Spacing scale 4/8/12/16/24/32/40/48.
- Radius scale: small, medium, large, pill.
- Elevation/shadow tokens.
- Grid dan responsive breakpoints.
- Icon style.
- Button variants: primary, secondary, outline, ghost, destructive, disabled, loading.
- Input variants: default, focus, filled, error, disabled.
- Select, date picker, search field, textarea, checkbox, radio, toggle.
- Status badges: Diproses, Dikemas, Dikirim, Selesai, Dibatalkan (status Dibatalkan ditampilkan sebagai status usulan/opsional sampai dikonfirmasi).
- Table, pagination, tabs, dropdown, modal, drawer, toast, tooltip, empty state, skeleton, alert.
- Form field dengan label, helper text, dan error message.

Gunakan Auto Layout, constraints, component properties, variants, dan penamaan layer yang rapi. Hindari group/layer bernama “Frame 123” atau “Rectangle 45”.

### 5. Struktur Pages Figma

Buat pages berikut secara berurutan:

1. `00 — Design System`
2. `01 — Admin Dashboard`
3. `02 — Orders Management`
4. `03 — Marketplace Import`
5. `04 — Master Data`
6. `05 — Employee Operations`
7. `06 — Production`
8. `07 — Responsive & Prototypes`

### 6. Halaman yang Harus Dirancang

#### A. Login
- Layout sederhana dan profesional.
- Branding Ratu Kriuk.
- Field username dan password.
- Show/hide password.
- Tombol Login.
- Error state untuk kredensial salah.
- Validation state untuk field kosong.
- Jangan tampilkan opsi registrasi publik karena akun diasumsikan sudah dibuat/tersedia.

#### B. Admin Dashboard
- Sidebar: Dashboard, Pesanan, Input Pesanan, Impor Marketplace, Produk, Pelanggan, Hasil Produksi.
- Topbar: nama halaman, pencarian (jika relevan), profil pengguna.
- KPI cards: total pesanan, pesanan Diproses, Dikemas, Dikirim/Selesai. Gunakan angka dummy yang jelas sebagai placeholder, bukan data nyata.
- Ringkasan status pesanan.
- Aktivitas pesanan terbaru.
- Ringkasan hasil produksi terbaru.
- Quick actions: Input Pesanan dan Impor Marketplace.
- Jangan mengarang metrik finansial atau grafik penjualan yang tidak ditetapkan kebutuhan.

#### C. Daftar Pesanan
- Tabel dengan kolom: nomor pesanan, pelanggan, tanggal, sumber, total pembayaran, status, aksi.
- Search berdasarkan nomor pesanan/nama pelanggan.
- Filter status, sumber pesanan, dan rentang tanggal.
- Pagination.
- Status badge konsisten.
- Aksi lihat detail dan ubah status.
- Buat state: default, filtered, empty, loading, error.
- Detail pesanan tampil sebagai halaman detail atau side drawer yang memuat pelanggan, item, kuantitas, harga satuan, subtotal, ongkir, total, status, dan histori status.
- Dialog konfirmasi ketika status diubah.

#### D. Input Pesanan Manual
- Buat form bertahap atau satu halaman yang terstruktur jelas.
- Bagian pelanggan: pilih pelanggan yang ada atau tambah pelanggan baru.
- Bagian produk: product selector/search, kuantitas, harga satuan, subtotal, tambah/hapus item.
- Bagian pengiriman: alamat/tujuan dan ongkos kirim.
- Ringkasan pembayaran: total produk, ongkir, total pembayaran.
- Tombol Simpan sebagai aksi utama; sediakan Batal.
- Tampilkan validasi produk tidak ditemukan, kuantitas kosong/tidak valid, data wajib belum lengkap, dan tujuan pengiriman belum lengkap.
- Ringkasan harus mudah dipindai dan angka total menonjol tanpa dekorasi berlebihan.

#### E. Impor Pesanan Marketplace
Rancang flow yang terdiri dari:
1. Pilih sumber marketplace (gunakan opsi generik sampai marketplace yang didukung dikonfirmasi).
2. Upload file melalui drag-and-drop atau browse.
3. Tampilkan format file yang didukung sebagai placeholder konfigurasi; jangan mengklaim format tertentu telah final.
4. Preview data dan mapping kolom.
5. Tampilkan validasi sebelum impor.
6. Konfirmasi impor.
7. Progress/loading state.
8. Hasil impor: jumlah berhasil, gagal, dan duplikat.
9. Tabel hasil dengan nomor baris/nomor pesanan, status, dan alasan error.
10. Tombol untuk mengunduh laporan hasil jika fitur ini dipilih pada implementasi.

Buat state untuk file belum dipilih, format tidak didukung, seluruh baris tidak valid, sebagian berhasil, dan impor selesai. Berikan penjelasan yang ramah dan actionable.

#### F. Master Data — Produk
- Tabel produk: SKU/kode, nama produk, harga, status aktif, aksi.
- Search.
- Tombol Tambah Produk.
- Form tambah/edit produk.
- Validasi harga tidak boleh negatif dan field wajib.
- Jangan menambahkan stok/inventaris sebagai field wajib.

#### G. Master Data — Pelanggan
- Tabel pelanggan: nama, kontak, alamat/tujuan, aksi.
- Search.
- Tombol Tambah Pelanggan.
- Form tambah/edit pelanggan.
- Detail pelanggan dapat ditampilkan dalam drawer.
- Jaga agar informasi kontak tidak terlalu terekspos pada halaman yang tidak memerlukannya.

#### H. Employee Dashboard / Daftar Packing
- UI lebih sederhana dan task-oriented.
- Fokus pada daftar pesanan yang belum dikemas.
- Setiap item menampilkan nomor pesanan, nama pelanggan seperlunya, tanggal, jumlah jenis item, dan ringkasan.
- Filter/pencarian ringan.
- Empty state: “Tidak ada pesanan yang perlu dikemas.”
- Klik item membuka detail packing.
- Detail packing menampilkan produk dan kuantitas dengan hierarki visual jelas.
- Tombol utama “Tandai Dikemas”.
- Dialog konfirmasi sebelum update.
- Jika pesanan sudah dikemas/dibatalkan, tampilkan informasi bahwa aksi tidak dapat dilakukan.
- Setelah sukses, pesanan menghilang dari daftar belum dikemas dan tampilkan toast konfirmasi.

#### I. Catat Hasil Produksi
- Form sederhana: pilih produk, jumlah hasil produksi, tanggal produksi, informasi/kode batch opsional sesuai keputusan final, catatan opsional.
- Jumlah harus positif.
- Tombol Simpan Hasil Produksi.
- State sukses dan validasi.
- Beri penekanan bahwa setiap penyimpanan menghasilkan batch baru, termasuk bila dicatat beberapa kali pada tanggal yang sama.

#### J. Hasil Produksi (Admin)
- Tabel batch produksi: tanggal, produk, jumlah, kode batch bila tersedia, pegawai pencatat.
- Filter tanggal dan produk.
- Detail batch.
- Ringkasan jumlah produksi berdasarkan filter.
- Jangan menambahkan fitur stok otomatis.

### 7. Prototype dan User Flow

Buat prototype interaktif untuk alur berikut:

**Flow 1 — Admin membuat pesanan manual**
Login → Dashboard → Input Pesanan → pilih pelanggan → tambah produk dan kuantitas → ringkasan total/ongkir → konfirmasi → sukses → Daftar Pesanan.

**Flow 2 — Admin impor marketplace**
Dashboard → Impor Marketplace → upload file → preview/validasi → konfirmasi → hasil impor → detail baris gagal/duplikat.

**Flow 3 — Admin mengubah status**
Daftar Pesanan → Detail Pesanan → Ubah Status → konfirmasi → status diperbarui.

**Flow 4 — Pegawai melakukan packing**
Login → Daftar Packing → Detail Pesanan → periksa item → Tandai Dikemas → konfirmasi → sukses → kembali ke daftar yang telah diperbarui.

**Flow 5 — Pegawai mencatat produksi**
Dashboard Pegawai → Catat Hasil Produksi → isi form → simpan → sukses.

### 8. UX Rules dan Microcopy

Gunakan Bahasa Indonesia yang singkat, jelas, dan konsisten.

Contoh:
- “Pesanan berhasil disimpan.”
- “Periksa kembali jumlah produk.”
- “Nomor pesanan ini sudah pernah diimpor.”
- “Produk tidak ditemukan. Periksa SKU atau data produk.”
- “Tidak ada pesanan yang perlu dikemas.”
- “Pesanan berhasil ditandai sebagai Dikemas.”
- “Hasil produksi berhasil dicatat.”
- “Terjadi kendala saat memuat data. Coba muat ulang.”

Hindari istilah teknis seperti API, payload, database, atau exception di UI pengguna.

### 9. Interaksi dan States Wajib

Setiap halaman penting harus memiliki:
- Default state.
- Loading/skeleton.
- Empty state.
- Error state.
- Success feedback.
- Validation state.
- Disabled state ketika aksi tidak valid.
- Confirmation modal untuk aksi yang mengubah data penting.

Gunakan focus state keyboard yang jelas. Pastikan tabel dapat dibaca dan tidak memaksa horizontal scrolling pada desktop.

### 10. Output yang Diharapkan dari Figma Agent

Hasilkan:
1. File Figma dengan pages sesuai struktur di atas.
2. Design system dengan color/text/effect styles dan reusable components.
3. High-fidelity desktop screens untuk seluruh halaman inti.
4. Responsive screens untuk login, daftar pesanan, input pesanan, impor, daftar packing, dan catat produksi.
5. Prototype yang menghubungkan lima user flow.
6. Komponen Auto Layout dan variants yang dapat diedit.
7. Layer naming yang konsisten dan mudah diserahkan ke developer.
8. Catatan asumsi dan pertanyaan terbuka pada page `07 — Responsive & Prototypes`.

### 11. Batasan Penting

- Jangan mengubah kebutuhan bisnis yang tercantum di atas.
- Jangan mengarang integrasi marketplace API.
- Jangan menganggap ongkir otomatis berdasarkan kurir sebelum aturan bisnis diberikan.
- Jangan menganggap semua pegawai memiliki akses yang sama.
- Jangan menampilkan status/fitur yang belum dikonfirmasi seolah-olah sudah final.
- Jangan membuat desain hanya berupa dashboard; semua alur operasional wajib dirancang.
- Prioritaskan konsistensi dan implementability dibanding efek visual yang dekoratif.

Sebelum menyelesaikan desain, periksa konsistensi istilah, navigasi antar-role, hierarchy, responsive behavior, dan prototype flow.
