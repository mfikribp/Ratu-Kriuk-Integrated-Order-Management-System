# Ratu Kriuk — Sistem Pencatatan Pesanan Terpadu

Aplikasi web internal untuk menyatukan pencatatan pesanan pelanggan, impor pesanan marketplace, pemantauan status pesanan, daftar pekerjaan packing, dan pencatatan hasil produksi.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript, Tailwind CSS + shadcn/ui
- **Backend**: Go + Gin
- **Database**: MySQL 8.x (via Laragon)
- **Auth**: Argon2id
- **Validation**: Zod + React Hook Form
- **Data Fetching**: TanStack Query

## Prerequisites

- Node.js 18.x atau lebih tinggi
- Go 1.21.x atau lebih tinggi
- Laragon dengan MySQL 8.x
- Git

## Setup Local Development

### 1. Clone Repository

```bash
git clone https://github.com/mfikribp/Ratu-Kriuk-Integrated-Order-Management-System.git
cd Ratu-Kriuk-Integrated-Order-Management-System
```

### 2. Setup Database

1. Jalankan Laragon dan start service MySQL
2. Buat database `ratu_kriuk`:
   ```sql
   CREATE DATABASE ratu_kriuk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 3. Setup Backend

```bash
cd services/api
cp ../../.env.example .env
# Edit .env sesuai konfigurasi MySQL Laragon Anda
go mod download
go run cmd/main.go
```

Backend akan berjalan di `http://localhost:8080`

### 4. Setup Frontend

```bash
cd apps/web/app
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### 5. Run Migration

```bash
# Coming soon: migration tool setup
```

## Project Structure

```
ratu-kriuk/
├── apps/
│   └── web/              # Next.js frontend
│       └── app/
├── services/
│   └── api/              # Go backend
│       ├── cmd/
│       └── internal/
├── migrations/           # Database migrations
├── docs/                 # Documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── TASKS.md
├── .env.example
└── README.md
```

## Development Workflow

1. Buat branch feature: `git checkout -b feature/nama-fitur`
2. Commit changes: `git commit -m "feat: deskripsi fitur"`
3. Push ke remote: `git push origin feature/nama-fitur`
4. Buat Pull Request

## Status

**WS-01 (Analisis & Keputusan Produk)**: ✅ Completed
- Role & hak akses finalized
- Status pesanan finalized
- Tech stack finalized
- MVP scope defined

**WS-03 (Foundation)**: 🚧 In Progress
- Repository setup: ✅
- Backend scaffold: ✅
- Database connection: ✅
- Migration schema: ✅
- Frontend scaffold: 🚧

## License

Internal use only - Ratu Kriuk