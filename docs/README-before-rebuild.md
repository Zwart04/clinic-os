# ClinicOS

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Clinic & Pharmacy Operating System** untuk praktik dokter kecil, klinik hewan, atau apotek komunitas di Indonesia. Sistem terpusat untuk registrasi pasien, antrian real-time, rekam medis, resep, stok obat, appointment booking dengan WhatsApp reminder, finance auto-journal, dan halaman publik untuk booking online.

**[Live Demo](https://clinic-os.zwart.qzz.io)** &nbsp;·&nbsp; **[Public Page Demo](https://clinic-os.zwart.qzz.io/c/klinik-sehat)**

## Highlights

- **8 fitur kompleks** (lihat [FEATURES.md](FEATURES.md)), bukan CRUD sederhana
- **Bilingual EN/ID** dengan toggle, theme light/dark
- **WAHA WhatsApp integration** untuk appointment reminder + prescription pickup
- **Auto-finance journal** dari visit done, dispense, dan stock-in
- **Public clinic page** (`/c/[slug]`) untuk SEO + booking online
- **Source attribution** (meta/google/tiktok/organic/direct) + Meta Pixel + Google Ads tracking
- **PDF/Excel export** untuk pasien, kunjungan, jurnal
- **Recharts dashboard** untuk KPI, tren, dan per-dokter performance
- **100% local-first** (localStorage + cross-tab sync via custom events) - tidak butuh server
- **Static export** - deploy gratis ke Cloudflare Pages / Vercel / Netlify

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) + Turbopack |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4 + custom CSS variables |
| Charts | Recharts 2.15 |
| Icons | lucide-react |
| PDF | jsPDF + jspdf-autotable |
| Excel | xlsx (SheetJS) |
| State | localStorage + `CustomEvent` sync |
| I18n | Custom ID/EN dict via React context |
| WhatsApp | devlikeapro/waha HTTP API |
| Deploy | Cloudflare Pages (static export) |

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Local Development
```bash
npm install
npm run dev
```
Buka `http://localhost:3000`.

### Production Build
```bash
npm run build
```
Output statis di folder `out/`. Bisa di-host di static hosting mana pun.

### Deploy ke Cloudflare Pages
```bash
CLOUDFLARE_API_KEY=xxx CLOUDFLARE_ACCOUNT_ID=xxx wrangler pages deploy out --project-name=clinic-os --branch=main --commit-dirty=true
wrangler pages domain add --project-name=clinic-os clinic-os.zwart.qzz.io
```

## Project Structure

```
clinic-os/
├── src/
│   ├── app/
│   │   ├── (protected)/     # Auth-gated routes
│   │   │   ├── dashboard/
│   │   │   ├── patients/
│   │   │   ├── visits/
│   │   │   ├── queue/
│   │   │   ├── appointments/
│   │   │   ├── pharmacy/
│   │   │   ├── finance/
│   │   │   ├── analytics/
│   │   │   ├── waha/
│   │   │   └── settings/
│   │   ├── c/[slug]/        # Public clinic page (SSG)
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx       # Root layout + AppProvider
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   └── app-shell.tsx    # Sidebar + top nav
│   └── lib/
│       ├── app-context.tsx  # Lang + theme + user context
│       ├── i18n.ts          # EN/ID dict
│       ├── store.ts         # localStorage DB + business logic
│       ├── pixel.ts         # Meta Pixel + GA4
│       ├── waha.ts          # WAHA HTTP client
│       └── utils.ts
├── public/
│   └── icon.svg
├── next.config.mjs          # output: 'export'
├── tailwind.config.js
├── tsconfig.json
├── FEATURES.md              # 8 fitur kompleks spec
└── README.md
```

## Fitur Detail

### 1. Patient Registry
Registrasi pasien dengan No. RM otomatis (RM-XXXX), alergi, kategori (umum/BPJS/asuransi), source attribution. CRUD + search + filter + export Excel/PDF.

### 2. Visit / Encounter Record
Pencatatan kunjungan: anamnesa, vital sign (BP/nadi/suhu), diagnosis, kode ICD-10, tindakan, resep. Status flow: waiting → in-room → done/cancelled. Auto-journal income.

### 3. Queue Board Real-time
Antrian harian dengan nomor otomatis, status real-time, estimasi waktu, source tracking.

### 4. Appointment Booking + WA Reminder
Booking janji temu dengan WhatsApp reminder via WAHA. Template message otomatis, audit log reminder.

### 5. Pharmacy & Stock
Manajemen obat lengkap: stok, min-stock alert, batch, exp date, harga modal/jual. Dispense on prescription otomatis kurangi stok + catat income.

### 6. Auto-Journal Finance
Otomatis: visit income, dispense income, stock-in expense. Manual entry untuk operasional. Chart 30 hari + export PDF.

### 7. Public Clinic Page `/c/[slug]`
Halaman publik SEO-friendly per klinik: profil, dokter, layanan, harga, form booking online. Auto-attribute booking ke source = slug.

### 8. Source Attribution + Pixel
Tracking sumber pasien/booking. Event ke Meta Pixel (fbq) + Google Ads (gtag) jika env var di-set. Local event log untuk audit.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID untuk fbq tracking |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads ID untuk gtag tracking |

WAHA URL di-set per-user di tab WhatsApp (tersimpan di localStorage).

## Demo Account

Login dengan email apapun + password ≥6 karakter (auto-register ke localStorage). Default sample data:
- 3 pasien (Budi, Siti, Andi)
- 4 obat (Paracetamol, Amoxicillin, OBH, Metformin)
- 1 appointment (besok)
- 1 visit history

Klik "Reset Data" di Settings untuk kembali ke sample.

## License

MIT © 2026 Zwart04

---

Powered by [ClinicOS](https://clinic-os.zwart.qzz.io) · Source: [GitHub](https://github.com/Zwart04/clinic-os)
