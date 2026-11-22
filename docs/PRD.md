# Product Requirements Document (PRD)
## Sistem Pencatatan Pesanan Terpadu — Ratu Kriuk

| Metadata | Nilai |
|---|---|
| Dokumen | Product Requirements Document |
| Produk | Sistem Pencatatan Pesanan Terpadu Ratu Kriuk |
| Versi | 1.1 — Local Development Scope |
| Status | Draft finalisasi produk (pendapatan pemilik proses belum disepakati) |
| Basis kebutuhan | Dokumen UML Artifacts Ratu Kriuk, 2026 |
| Bahasa | Indonesia |

---

## 1. Ringkasan Produk

Sistem Pencatatan Pesanan Terpadu Ratu Kriuk adalah aplikasi internal untuk menyatukan pencatatan pesanan pelanggan, impor pesanan marketplace, pemantauan status pesanan, daftar pekerjaan packing, dan pencatatan hasil produksi.

Sistem ditujukan untuk dua kelompok pengguna utama:
- **Admin/Owner**: mengelola data produk dan pelanggan, membuat pesanan manual, mengimpor pesanan marketplace, memantau dan memperbarui status pesanan, serta memantau hasil produksi.
- **Pegawai**: melihat daftar packing, menandai pesanan yang selesai dikemas, dan mencatat hasil produksi. Pegawai dapat memiliki fungsi operasional berbeda sesuai tugasnya; hak akses rinci perlu dikonfirmasi.

Tujuan utamanya adalah mengurangi pencatatan terpisah/manual, mengurangi kesalahan input, menghindari impor pesanan ganda, dan memberi visibilitas status pesanan kepada admin serta pegawai.

## 2. Latar Belakang dan Masalah

Berdasarkan use case dan skenario pada dokumen sumber:
1. Pesanan dapat dimasukkan secara manual oleh Admin/Owner.
2. Pesanan marketplace perlu diimpor dari file ekspor agar tidak perlu dimasukkan satu per satu.
3. Total produk, ongkos kirim, dan total pembayaran perlu dihitung dalam proses input manual.
4. Admin/Owner perlu memperbarui status pesanan dan memantau prosesnya.
5. Pegawai membutuhkan daftar pesanan yang belum dikemas beserta rincian produk dan jumlah.
6. Pegawai perlu menandai pesanan sebagai dikemas setelah pengepakan selesai.
7. Pegawai bagian produksi perlu mencatat hasil produksi sebagai batch baru, termasuk ketika beberapa pencatatan terjadi pada hari yang sama.

### 2.1 Sasaran Produk

- Menyediakan satu sumber data pesanan yang dapat digunakan Admin/Owner dan Pegawai.
- Mempercepat input pesanan manual dan impor pesanan marketplace.
- Menyediakan validasi data dan pencegahan duplikasi berdasarkan nomor pesanan.
- Menyajikan daftar packing yang selalu mengikuti status pesanan terkini.
- Menyimpan catatan hasil produksi per batch agar dapat dipantau Admin.

### 2.2 Bukan Sasaran (Out of Scope untuk versi awal)

Hal-hal berikut tidak dinyatakan sebagai kebutuhan dalam dokumen sumber, sehingga tidak dianggap bagian dari MVP:
- Integrasi API langsung ke Shopee, Tokopedia, TikTok Shop, atau marketplace lain.
- Sinkronisasi stok otomatis atau manajemen inventaris bahan baku.
- Akuntansi, pembukuan, laporan laba-rugi, dan rekonsiliasi pembayaran.
- Pengelolaan kurir, pelacakan resi real-time, atau integrasi jasa ekspedisi.
- Portal pelanggan atau aplikasi mobile native.
- Notifikasi WhatsApp/email otomatis.
- Multi-cabang, multi-gudang, dan multi-perusahaan.

Fitur tersebut dapat dipertimbangkan setelah proses inti tervalidasi.

## 3. Pengguna dan Hak Akses

### 3.1 Persona

**Admin/Owner**
- Membutuhkan ringkasan pesanan dan progres operasional.
- Mengelola data master produk dan pelanggan.
- Membuat pesanan manual dan mengimpor pesanan marketplace.
- Memperbarui status pesanan.
- Memantau hasil produksi.

**Pegawai**
- Membutuhkan tampilan operasional yang sederhana dan cepat digunakan.
- Melihat pesanan yang perlu dikemas dan rincian itemnya.
- Menandai pesanan sebagai dikemas setelah pengecekan fisik.
- Mencatat hasil produksi bila bertugas di bagian produksi.

### 3.2 Matriks Hak Akses Finalisasi (disetujui)

| Modul/Aksi | Admin/Owner | Pegawai (Packing) | Pegawai (Produksi) |
|---|---|---|---|
| Login/logout | Ya | Ya | Ya |
| Dashboard sesuai peran | Ya | Ya | Ya |
| Kelola data produk | Ya | Tidak | Tidak |
| Kelola data pelanggan | Ya | Tidak | Tidak |
| Input pesanan manual | Ya | Tidak | Tidak |
| Impor pesanan marketplace | Ya | Tidak | Tidak |
| Lihat daftar pesanan | Ya | Tidak | Tidak |
| Ubah status pesanan | Ya | Hanya via aksi Packing | Tidak |
| Ubah status admin | Ya | Tidak | Tidak |
| Dibatalkan pesanan | Ya | Tidak | Tidak |
| Lihat daftar packing | Opsional | Ya | Tidak |
| Tandai pesanan dikemas | Tidak | Ya | Tidak |
| Catat hasil produksi | Tidak | Tidak | Ya |
| Lihat/hasil produksi | Ya | Tidak | Tidak |

**Catatan keputusan:** dokumen sumber menyebut Pegawai sebagai aktor untuk daftar packing dan produksi, serta Admin/Owner sebagai aktor pengelolaan data, pesanan manual, impor, dan perubahan status. Hak akses di luar itu jangan diasumsikan aktif sebelum disepakati.

## 4. Ruang Lingkup Fungsional

MVP mencakup use case UC-01 sampai UC-09.

### 4.1 UC-01 — Login

**Aktor:** Admin/Owner, Pegawai

**Kebutuhan:**
- Pengguna memasukkan username dan password.
- Sistem memvalidasi kredensial.
- Jika valid, pengguna diarahkan ke dashboard sesuai peran.
- Jika salah, tampilkan pesan kesalahan tanpa meninggalkan halaman login.
- Jika kolom wajib kosong, tampilkan validasi.

**Kriteria penerimaan:**
- Pengguna dengan akun aktif dapat masuk.
- Pengguna dengan password/username salah tidak memperoleh sesi.
- Form menampilkan validasi untuk kolom kosong.
- Menu yang tersedia mengikuti peran pengguna.

### 4.2 UC-02 — Input Pesanan Manual

**Aktor:** Admin/Owner

**Kebutuhan:**
- Admin membuka formulir input pesanan.
- Admin memilih pelanggan yang sudah terdaftar atau memasukkan data pelanggan baru.
- Admin memilih satu atau lebih produk dan jumlah masing-masing.
- Sistem memvalidasi item dan menghitung total harga serta ongkos kirim.
- Admin memeriksa ringkasan dan mengonfirmasi penyimpanan.
- Pesanan tersimpan dengan status awal dan tampil di daftar pesanan serta daftar packing sesuai statusnya.

**Data minimum yang diperlukan (sebagian merupakan rancangan implementasi):**
- Identitas pelanggan: nama dan kontak; alamat/tujuan pengiriman diperlukan untuk ongkir.
- Sumber pesanan: manual.
- Tanggal pesanan.
- Daftar item: produk, harga satuan saat transaksi, kuantitas, subtotal.
- Ongkos kirim, total produk, total pembayaran.
- Status pesanan.

**Kriteria penerimaan:**
- Produk yang tidak ditemukan ditolak dengan pesan yang jelas.
- Kuantitas wajib berupa bilangan bulat positif.
- Data wajib yang belum diisi ditandai.
- Subtotal = harga satuan × kuantitas.
- Total produk = jumlah seluruh subtotal.
- Total pembayaran = total produk + ongkos kirim.
- Ringkasan terlihat sebelum penyimpanan.
- Pesanan hanya tersimpan setelah admin mengonfirmasi.

### 4.3 UC-03 — Hitung Total dan Ongkir

**Aktor:** Sistem (bagian dari UC-02)

**Kebutuhan:**
- Mengambil harga satuan produk dari data produk.
- Menghitung subtotal per item.
- Menjumlahkan subtotal.
- Menentukan ongkos kirim berdasarkan tujuan pengiriman pelanggan.
- Menghasilkan total pembayaran.

**Kriteria penerimaan:**
- Sistem tidak menghitung bila daftar item kosong.
- Harga produk yang tidak tersedia/tidak valid menghasilkan kesalahan.
- Ongkir dimasukkan manual oleh Admin; nilai wajib berupa angka non-negatif.
- Data tujuan yang wajib: alamat/tujuan pengiriman pelanggan (diambil dari master pelanggan).
- Nilai perhitungan diperbarui ketika item, kuantitas, atau tujuan berubah.

**Aturan Ongkos Kirim (Final):**
- Ongkos kirim dimasukkan manual oleh Admin/Owner pada form Input Pesanan Manual.
- Ongkir tidak dihitung dari tabel tarif pada MVP (tarif dapat ditambahkan pada versi berikutnya).
- Validasi: `shipping_cost >= 0`, default 0.
- Nilai ongkir disimpan dalam field `shipping_cost` pada tabel `orders` dan menjadi bagian dari `grand_total = product_total + shipping_cost`.

### 4.4 UC-04 — Impor Pesanan Marketplace

**Aktor:** Admin/Owner

**Kebutuhan:**
- Admin memilih file hasil ekspor marketplace (format CSV atau XLSX).
- Sistem memeriksa format, ekstensi, dan header file.
- Sistem memvalidasi tiap baris: memeriksa kolom wajib, duplikasi nomor pesanan, dan mencocokkan produk.
- Baris valid disimpan sebagai pesanan dengan status `Diproses`.
- Sistem menampilkan ringkasan jumlah berhasil, gagal, dan duplikat beserta alasan kegagalan per baris.

**Kriteria penerimaan:**
- Admin tidak dapat memulai impor tanpa memilih file.
- Format yang tidak didukung (bukan CSV/XLSX) ditolak.
- File dengan seluruh baris tidak valid tidak membuat pesanan.
- Baris tidak valid tidak menggagalkan penyimpanan baris valid lainnya.
- Nomor pesanan yang sudah pernah diimpor tidak disimpan ulang (unique constraint).
- Produk yang tidak cocok ditandai sebagai `FAILED` dan diberi alasan "Produk tidak ditemukan di master data".
- Admin dapat melihat rincian hasil validasi (per baris, nomor baris, alasan kegagalan).

**Asumsi implementasi yang sudah disepakati:**
- Format file MVP: CSV dan/atau XLSX. Kolom wajib: Order Number, Tanggal, Nama Pelanggan, SKU/Nama Produk, Jumlah, Harga, Ongkir.
- Satu order dapat terdiri dari beberapa baris produk; penggabungan dilakukan berdasarkan Nomor Pesanan eksternal.
- Normalisasi Nomor Pesanan (trim whitespace, case-insensitive) sebelum pengecekan duplikasi.
- Pencocokan produk: primary menggunakan SKU (case-sensitive exact match); fallback ke Nama Produk (case-insensitive, after trim). Jika multiple match, ambil yang pertama.
- Impor tidak menggunakan API marketplace pada MVP; data hanya dari file ekspor yang diunggah.
- Idempotensi: file yang sama diunggah kembali tidak membuat pesanan duplikat karena unique constraint pada `orders.order_number`.

### 4.5 UC-05 — Validasi dan Impor

**Aktor:** Sistem (bagian dari UC-04)

**Validasi minimum:**
- Tipe/ekstensi dan ukuran file.
- Kolom wajib dan header.
- Nilai per baris (format tanggal, kuantitas positif, harga numerik).
- Nomor pesanan duplikat.
- Kecocokan produk dengan master produk.
- Kuantitas dan harga yang valid.

**Kriteria penerimaan:**
- Sistem menampilkan nomor baris dan alasan setiap kegagalan.
- Sistem memproses baris secara terisolasi sehingga satu baris gagal tidak menghentikan baris valid lain.
- Sistem menyimpan hasil impor agar dapat diaudit.
- Proses penyimpanan mencegah duplikasi meskipun dua proses impor berlangsung hampir bersamaan.

### 4.5 UC-05 — Validasi dan Impor

**Aktor:** Sistem (bagian dari UC-04)

**Validasi minimum:**
- Tipe/ekstensi dan ukuran file.
- Kolom wajib dan header.
- Nilai per baris.
- Nomor pesanan duplikat.
- Kecocokan produk dengan master produk.
- Kuantitas dan harga yang valid.

**Kriteria penerimaan:**
- Sistem menampilkan nomor baris dan alasan setiap kegagalan.
- Sistem memproses baris secara terisolasi sehingga satu baris gagal tidak menghentikan baris valid lain.
- Sistem menyimpan hasil impor agar dapat diaudit.
- Proses penyimpanan mencegah duplikasi meskipun dua proses impor berlangsung hampir bersamaan.

### 4.6 UC-06 — Ubah Status Pesanan

**Aktor:** Admin/Owner

**Kebutuhan:**
- Admin melihat daftar pesanan.
- Admin memilih pesanan dan status baru.
- Sistem memvalidasi transisi status.
- Sistem menyimpan status baru dan memperbarui tampilan daftar pesanan serta daftar packing.
- Sistem menampilkan notifikasi hasil.

**State Machine Pesanan (Final):**
- Status awal: `Diproses`.
- Transisi normal: `Diproses → Dikemas → Dikirim → Selesai`.
- Status `Dibatalkan` hanya dapat ditetapkan Admin/Owner dari status `Diproses` atau `Dikemas`.
- Status `Dikemas` juga dapat dihasilkan oleh aksi "Tandai Dikemas" Pegawai.
- Transisi mundur atau lompatan status ditolak.

**Matriks Transisi yang Diperbolehkan:**

| Status Saat Ini | Status Tujuan | Admin/Owner | Pegawai Packing |
|---|---|---|---|
| Diproses | Dikemas | Ya | Ya (via aksi Packing) |
| Diproses | Dibatalkan | Ya | Tidak |
| Dikemas | Dikirim | Ya | Tidak |
| Dikemas | Dibatalkan | Ya | Tidak |
| Dikirim | Selesai | Ya | Tidak |
| Dikirim | Dibatalkan | Ya | Tidak |

**Kriteria penerimaan:**
- Pesanan yang tidak ditemukan tidak dapat diubah.
- Transisi yang tidak diizinkan ditolak (HTTP 422).
- Pembatalan dari dialog konfirmasi tidak mengubah data.
- Perubahan yang berhasil terlihat setelah data dimuat ulang.
- Histori status tercatat (actor, timestamp, catatan).

### 4.7 UC-07 — Lihat Daftar Packing

**Aktor:** Pegawai

**Kebutuhan:**
- Menampilkan pesanan yang belum dikemas.
- Pegawai dapat memilih pesanan untuk melihat detail item dan kuantitas.
- Sistem menyediakan keadaan kosong dan penanganan kegagalan pemuatan.

**Kriteria penerimaan:**
- Daftar hanya memuat pesanan yang memenuhi definisi “belum dikemas”.
- Detail pesanan menampilkan produk dan jumlah.
- Jika tidak ada data, tampilkan empty state yang informatif.
- Jika gagal memuat, tampilkan opsi muat ulang.

### 4.8 UC-08 — Tandai Pesanan Dikemas

**Aktor:** Pegawai

**Kebutuhan:**
- Pegawai membuka daftar packing dan memilih pesanan.
- Pegawai memeriksa item serta kuantitas.
- Pegawai menekan “Tandai Dikemas” setelah proses packing selesai.
- Sistem memvalidasi bahwa pesanan belum dikemas dan tidak dibatalkan.
- Sistem memperbarui status menjadi `Dikemas`.
- Pesanan hilang dari daftar packing belum dikemas dan perubahan terlihat oleh Admin.

**Kriteria penerimaan:**
- Pesanan yang sudah dikemas tidak dapat ditandai ulang.
- Pesanan yang dibatalkan tidak dapat dikemas.
- Pesanan yang tidak ditemukan menghasilkan pesan yang sesuai.
- Kegagalan penyimpanan tidak menampilkan sukses palsu dan menyediakan tindakan coba lagi.
- Aksi sukses memperbarui daftar packing.

### 4.9 UC-09 — Catat Hasil Produksi

**Aktor:** Pegawai (Bagian Produksi)

**Kebutuhan:**
- Pegawai memilih produk.
- Pegawai memasukkan jumlah hasil produksi.
- Pegawai mengisi tanggal produksi atau informasi batch.
- Sistem memvalidasi dan menyimpan hasil produksi sebagai batch baru.
- Admin dapat melihat dan memantau catatan produksi.

**Kriteria penerimaan:**
- Produk harus tersedia pada master produk.
- Jumlah harus bilangan positif.
- Tanggal/informasi batch wajib sesuai aturan yang ditetapkan.
- Setiap penyimpanan menghasilkan catatan batch baru, termasuk beberapa pencatatan pada hari yang sama.
- Data yang tersimpan dapat ditampilkan kepada Admin.

## 5. Kebutuhan Non-Fungsional

| Area | Persyaratan MVP |
|---|---|
| Keamanan | Password disimpan dalam bentuk hash; semua endpoint privat memerlukan autentikasi; otorisasi berbasis peran. |
| Privasi | Data pelanggan hanya ditampilkan kepada pengguna yang berwenang dan tidak dicatat ke log secara berlebihan. |
| Integritas | Nomor pesanan marketplace unik; transaksi penyimpanan pesanan dan detailnya bersifat atomik. |
| Validasi | Validasi dilakukan di UI dan server; server menjadi sumber kebenaran. |
| Kinerja | Halaman daftar menggunakan pagination; target awal respons API normal < 2 detik pada beban operasional kecil (target usulan, perlu diuji). |
| Ketersediaan | Pesan error dan mekanisme retry yang jelas; backup database terjadwal sebelum penggunaan produksi. |
| Usability | Bahasa antarmuka Indonesia, label status konsisten, formulir ringkas, dan desain responsif desktop/tablet. |
| Auditabilitas | Simpan waktu dan pengguna pembuat/perubah pesanan, status, impor, dan batch produksi. |
| Kompatibilitas | Browser modern berbasis Chromium, Firefox, dan Safari versi terkini. |

## 6. Informasi dan Entitas Data

Entitas yang terlihat pada class diagram sumber (halaman 16):
- `Pengguna`
- `Admin`
- `Pegawai`
- `Pelanggan`
- `Pesanan`
- `Detail Pesanan`
- `Produk`
- `Hasil Produksi`

Relasi utama yang tergambar:
- Admin dan Pegawai merupakan turunan/jenis dari Pengguna.
- Pelanggan dapat memiliki banyak Pesanan.
- Pesanan memiliki Detail Pesanan.
- Detail Pesanan mengacu pada Produk.
- Produk dapat memiliki banyak catatan Hasil Produksi.

Atribut yang tampak pada diagram antara lain username/password/role, data pelanggan, tanggal/status/total pesanan, jumlah/subtotal detail, data produk, dan jumlah/tanggal hasil produksi. Atribut teknis tambahan seperti ID stabil, timestamp, sumber pesanan, nomor pesanan marketplace, dan audit fields merupakan usulan implementasi.

## 7. Alur Pengguna Utama

### 7.1 Pesanan Manual
Login Admin → Input Pesanan → pilih/tambah pelanggan → pilih produk dan kuantitas → hitung total dan ongkir → tinjau ringkasan → konfirmasi → pesanan tersimpan → tampil di daftar pesanan.

### 7.2 Impor Marketplace
Login Admin → Impor Marketplace → pilih file → validasi file/baris → cek duplikasi dan kecocokan produk → simpan baris valid → tampilkan ringkasan berhasil/gagal/duplikat → pesanan valid masuk ke daftar pesanan.

### 7.3 Packing
Login Pegawai → Daftar Packing → pilih pesanan → periksa item dan jumlah → proses pengepakan fisik → Tandai Dikemas → status menjadi Dikemas → pesanan hilang dari daftar belum dikemas.

### 7.4 Produksi
Login Pegawai Produksi → Catat Hasil Produksi → pilih produk → isi jumlah dan tanggal/batch → simpan → batch baru tersedia untuk dipantau Admin.

## 8. Struktur Navigasi yang Diusulkan

**Admin/Owner**
- Dashboard
- Pesanan
  - Daftar Pesanan
  - Input Pesanan
  - Impor Marketplace
- Data Master
  - Produk
  - Pelanggan
- Produksi
  - Hasil Produksi
- Pengaturan Akun (profil/logout; pengelolaan akun perlu keputusan tambahan)

**Pegawai**
- Dashboard Operasional
- Daftar Packing
- Catat Hasil Produksi (hanya bila pegawai memiliki tugas produksi)
- Profil/Logout

Menu dapat disesuaikan dengan hak akses yang telah disetujui.

## 9. Halaman dan Komponen UI

| Halaman | Komponen utama |
|---|---|
| Login | Username, password, show/hide password, validasi, tombol login |
| Dashboard Admin | Ringkasan jumlah pesanan, distribusi status, aktivitas terbaru, ringkasan produksi |
| Daftar Pesanan | Search, filter status/sumber/tanggal, tabel, pagination, detail pesanan, aksi ubah status |
| Input Pesanan | Pencarian/pemilihan pelanggan, tambah pelanggan, product picker, quantity stepper, alamat/tujuan, ongkir, ringkasan total |
| Impor Marketplace | Dropzone, pemilihan file, instruksi format, preview, progress, ringkasan hasil, tabel error |
| Produk | Tabel produk, pencarian, tambah/edit produk |
| Pelanggan | Tabel pelanggan, pencarian, tambah/edit pelanggan |
| Daftar Packing | Daftar pesanan belum dikemas, prioritas/tanggal, detail item, checklist visual, tombol tandai dikemas |
| Catat Produksi | Pilih produk, jumlah, tanggal produksi, kode/catatan batch, tombol simpan |
| Hasil Produksi | Tabel batch, filter produk/tanggal, ringkasan jumlah produksi |

Halaman produk/pelanggan dan dashboard merupakan elaborasi UI dari use case “Kelola Data Produk/Pelanggan” dan kebutuhan pemantauan pada diagram use case/class diagram; detail CRUD perlu diselaraskan dengan kebutuhan operasional.

## 10. Metrik Keberhasilan

Metrik berikut adalah usulan evaluasi, bukan data aktual:
- Persentase pesanan marketplace yang berhasil diimpor tanpa input ulang.
- Jumlah duplikasi pesanan yang berhasil dicegah.
- Waktu rata-rata input pesanan manual.
- Waktu dari pesanan masuk sampai ditandai dikemas.
- Persentase catatan produksi yang tersimpan lengkap.
- Jumlah kesalahan input yang membutuhkan koreksi manual.

Baseline dan target numerik ditetapkan setelah observasi proses Ratu Kriuk.

## 11. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Format ekspor marketplace berbeda-beda | Impor gagal/salah pemetaan | Buat template mapping per marketplace dan uji dengan file nyata. |
| Nama produk di file tidak sama dengan master | Pesanan gagal diimpor | Gunakan SKU/kode produk sebagai kunci pencocokan bila tersedia; sediakan mapping manual. |
| Aturan ongkir belum jelas | Total pembayaran tidak akurat | Konfirmasi aturan ongkir; sementara sediakan input manual yang dapat diaudit. |
| Status pesanan tidak konsisten | Daftar packing keliru | Tetapkan state machine dan validasi transisi di server. |
| Aksi packing bersamaan | Status tertimpa | Gunakan optimistic locking/validasi status terkini saat update. |
| Hak akses belum rinci | Data/aksi terlihat oleh pihak yang tidak tepat | Finalisasi matriks role-permission sebelum implementasi. |
| Data pelanggan sensitif | Kebocoran data | Batasi akses, gunakan HTTPS, dan hindari data sensitif pada log. |

## 12. Keputusan Terbuka / Keputusan yang Sudah Disepakati

| # | Pertanyaan | Keputusan / Status | Keterangan |
|---|---|---|---|
| 1 | Apa saja marketplace yang akan didukung pada MVP? | Resolved | Tidak ada integrasi API langsung; hanya file ekspor (CSV/XLSX) yang diunggah Admin. |
| 2 | Contoh file ekspor apa yang digunakan dan formatnya? | Pending | Contoh file aktual (CSV dan XLSX) masih harus dikumpulkan dari pihak Ratu Kriuk. |
| 3 | Satu nomor pesanan dapat berisi beberapa baris? | Resolved | Ya; penggabungan baris dilakukan berdasarkan Nomor Pesanan eksternal. |
| 4 | Pencocokan produk memakai SKU, kode internal, atau nama produk? | Resolved | Primary: SKU (exact, case-sensitive); fallback: Nama Produk (case-insensitive, after trim). |
| 5 | Bagaimana ongkir dihitung? | Resolved | Input manual oleh Admin/Owner, validasi numerik non-negatif, default 0. |
| 6 | Status awal dan daftar status final yang disetujui? | Resolved | Awal: `Diproses`; final: `Dikemas`, `Dikirim`, `Selesai`; tambahan: `Dibatalkan`. |
| 7 | Apakah `Dibatalkan` status resmi dan siapa yang boleh menetapkannya? | Resolved | Ya, status resmi; hanya Admin/Owner yang boleh menetapkannya dari `Diproses` atau `Dikemas`. |
| 8 | Pegawai dibagi menjadi packing dan produksi? | Resolved | Ya; tiga role: Admin/Owner, Pegawai Packing, Pegawai Produksi. |
| 9 | Pegawai boleh melihat seluruh detail pelanggan atau hanya info untuk packing? | Resolved | Hanya informasi yang diperlukan untuk packing (produk, kuantitas, alamat minimal). |
| 10 | Admin/Owner perlu membuat akun pegawai dan mengatur role? | Resolved | Ya; Admin/Owner mengelola akun pengguna dan role. |
| 11 | Harga produk disimpan sebagai snapshot pada detail pesanan? | Resolved | Ya (direkomendasikan); mencegah perubahan master mengubah histori transaksi. |
| 12 | Perlu cetak label/resi atau nota pada versi awal? | Pending | Masih tertunda; bukan bagian dari MVP. |

## 13. Rencana Rilis MVP

**Tahap 0 — Klarifikasi (sudah selesai)**
- Validasi alur kerja aktual dari dokumen UML.
- Kumpulkan contoh file ekspor marketplace (masih pending).
- Finalisasi status, ongkir, role, dan atribut data (sudah selesai).

**Tahap 1 — Fondasi**
- Setup aplikasi, database, autentikasi, role/permission.
- CRUD produk dan pelanggan.
- Kerangka dashboard dan navigasi.

**Tahap 2 — Pesanan**
- Input pesanan manual.
- Perhitungan subtotal/total/ongkir.
- Daftar pesanan dan perubahan status.

**Tahap 3 — Impor**
- Upload dan validasi file.
- Mapping kolom dan produk.
- Deteksi duplikasi serta laporan hasil impor.

**Tahap 4 — Operasional**
- Daftar packing dan aksi tandai dikemas.
- Pencatatan hasil produksi dan tampilan pemantauan Admin.

**Tahap 5 — QA dan UAT**
- Uji skenario utama dan alternatif UC-01 sampai UC-09.
- Uji role, validasi, duplikasi, transisi status, dan kegagalan jaringan.
- UAT bersama Admin/Owner dan Pegawai.

## 14. Definisi Selesai (MVP)

MVP dapat dinyatakan siap diuji pengguna jika:
- Seluruh use case UC-01–UC-09 memiliki implementasi dan pengujian.
- Hak akses Admin/Owner dan Pegawai bekerja sesuai matriks yang disepakati.
- Pesanan manual tersimpan dengan perhitungan yang benar.
- Impor menolak format/kolom salah, melewati baris tidak valid, dan mencegah duplikasi.
- Perubahan status tersinkron pada daftar pesanan dan packing.
- Pegawai dapat menandai pesanan valid sebagai Dikemas.
- Catatan produksi tersimpan sebagai batch terpisah.
- Tidak ada bug kritis pada alur inti dan UAT disetujui.

## 15. Keterlacakan ke Dokumen UML

| Kebutuhan | Sumber |
|---|---|
| Login | UC-01, halaman 2 |
| Input Pesanan Manual | UC-02, halaman 3–4 |
| Hitung Total dan Ongkir | UC-03, halaman 5–6 |
| Impor Pesanan Marketplace | UC-04, halaman 7–8 |
| Validasi dan Impor | UC-05, halaman 9 |
| Ubah Status Pesanan | UC-06, halaman 10 |
| Lihat Daftar Packing | UC-07, halaman 11 |
| Tandai Pesanan Dikemas | UC-08, halaman 12–13 |
| Catat Hasil Produksi | UC-09, halaman 14–15 |
| Entitas dan relasi domain | Class Diagram, halaman 16 |
| Interaksi pesanan manual | Sequence Diagram, halaman 17 |
| Interaksi impor marketplace | Sequence Diagram, halaman 18 |
| Interaksi ubah status | Sequence Diagram, halaman 19 |
| Interaksi tandai dikemas | Sequence Diagram, halaman 20 |
| Interaksi hasil produksi | Sequence Diagram, halaman 21 |

## 15. Keputusan Arsitektur dan Trade-off (Final WS-01)

| Keputusan | Alasan | Trade-off |
|---|---|---|
| Role-based access split | Pegawai dibagi Packing & Produksi untuk efisiensi | Admin harus kelola 2 tipe akun pegawai |
| Unique order_number | Mencegah impor marketplace ganda | Perlu normalisasi nomor sebelum simpan |
| Snapshot harga/nama | Histori transaksi akurat meski master data berubah | Redundansi data di tabel detail |
| Manual shipping cost | Tarif wilayah belum disepakati tim | Admin input manual per pesanan |
| Status machine kaku | Mencegah kesalahan operasional di lapangan | Admin harus intervensi jika status salah |
