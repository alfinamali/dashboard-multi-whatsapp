# Dashboard Multi WhatsApp (versi statis)

Antarmuka tiga panel ala Thunderbird untuk mengelola banyak nomor WhatsApp outlet:
daftar outlet, daftar percakapan, dan isi chat. Versi ini **statis dengan data contoh**:
belum ada backend, database, atau koneksi ke WhatsApp Cloud API.

**Stack:** Next.js 15 (App Router, static export), Material UI 6, JavaScript, Docker + nginx, GitLab CI.

## Fitur
- Filter per outlet dan badge pesan belum dibaca
- Indikator jendela balasan 24 jam
- Jika jendela berakhir, kolom balasan berganti menjadi pilihan template
- Tema terang/gelap mengikuti sistem, layout responsif

## Struktur
```
src/
  app/layout.js         # provider MUI dan tema
  app/page.js           # halaman utama
  components/Dashboard.js  # seluruh UI + data contoh (SEED)
  theme.js              # tema MUI
nginx.conf              # konfigurasi nginx untuk image produksi
Dockerfile              # build statis lalu disajikan nginx
docker-compose.yml
.gitlab-ci.yml
```

## Menjalankan
Prasyarat: Node.js 22+ atau Docker.

```bash
# Pengembangan
npm install
npm run dev              # http://localhost:3000

# Build statis (hasil di folder out/)
npm run build

# Docker
docker compose up --build   # http://localhost:8080
```

Setelah `npm install` pertama, commit `package-lock.json` (pipeline memakai `npm ci`).

## CI/CD (GitLab)
Pipeline di `.gitlab-ci.yml`:

| Tahap | Job | Keterangan |
|---|---|---|
| test | `build-check` | `npm ci` dan `npm run build` |
| build | `docker-image` | build dan push image ke GitLab Container Registry (branch default) |
| deploy | `deploy` | manual, SSH ke server lalu `docker compose pull && up -d` |

Variabel CI/CD yang perlu diisi untuk deploy: `SSH_PRIVATE_KEY`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`.

Di server, `docker-compose.yml` harus memakai `image: registry.gitlab.com/<grup>/<proyek>:latest`
(bukan `build: .`) dan port-nya disesuaikan.

## Mengganti data contoh
Data ada di konstanta `SEED` dan `OUTLETS` pada `src/components/Dashboard.js`.
Fungsi `send()` di file yang sama saat ini hanya menambah pesan di layar.

## Langkah berikutnya
1. Tambahkan backend: webhook WhatsApp Cloud API, penyimpanan pesan, dan endpoint kirim pesan.
2. Hapus `output: 'export'` di `next.config.js` dan ganti Dockerfile ke mode `standalone` (butuh runtime Node).
3. Tambahkan login dan hak akses per outlet.
4. Sinkronkan template pesan yang disetujui Meta.

## Catatan
- Pesan pertama ke pelanggan atau di luar jendela 24 jam wajib memakai template yang disetujui Meta.
- Tarif pesan Meta berubah berkala (termasuk pesan layanan sejak 1 Oktober 2026). Cek halaman harga resmi sebelum menghitung biaya.
