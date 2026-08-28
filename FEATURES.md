# ClinicOS - Features (8 Kompleks)

## 1. Patient Registry
Registrasi pasien lengkap dengan nomor rekam medis otomatis (RM-XXXX), data demografi (nama, TTL, jenis kelamin, no HP, alamat), alergi, kategori pembayaran (umum/BPJS/asuransi), dan source attribution (meta/google/tiktok/organic/direct). Dilengkapi dengan validasi form, search, filter per kategori, dan export ke Excel + PDF.

## 2. Visit/Encounter Record (Rekam Medis)
Pencatatan kunjungan per pasien: tanggal, dokter (5 pilihan dokter), anamnesa (chief complaint), tanda vital (BP/nadi/suhu), diagnosis, kode ICD-10, tindakan, resep, biaya konsultasi. Status: waiting -> in-room -> done / cancelled. Auto-journal income saat status=done.

## 3. Queue Board Real-time
Antrian harian dengan nomor urut otomatis, status real-time (waiting/in-room/done/cancelled), estimasi waktu per pasien, source attribution, dan tombol call-next. Update state otomatis ter-persist ke localStorage dan broadcast via custom event untuk sync antar tab.

## 4. Appointment Booking + WhatsApp Reminder (WAHA)
Janji temu dengan input tanggal/waktu, durasi, dokter, alasan, dan source. Satu klik "Send Reminder" mengirim template WhatsApp ke nomor pasien via WAHA HTTP API (`POST /api/sendText`). Tracking status: scheduled -> confirmed -> done, dan audit log "reminder sent".

## 5. Pharmacy & Stock Management
Manajemen obat: nama, SKU, satuan (tablet/strip/botol/box/sachet), stok, min-stock alert, harga modal & jual, batch, exp date, supplier. Auto-journal expense untuk stock-in. Dispense dari resep: pilih obat, qty, otomatis kurangi stok + catat income + trigger pixel event `DispenseFilled`.

## 6. Auto-Journal Finance
Jurnal keuangan otomatis:
- `auto-visit` (income) - saat kunjungan status=done
- `auto-dispense` (income) - saat obat di-dispense
- `auto-stock` (expense) - saat tambah stok obat
- `manual` (income/expense) - entri manual untuk operasional

Dilengkapi dengan chart 30 hari (income vs expense) dan export PDF laporan.

## 7. Public Clinic Page /c/[slug]
Halaman publik untuk setiap klinik (berdasarkan slug), SEO-friendly, menampilkan: profil klinik, daftar dokter + jadwal, layanan + harga, form booking janji temu. Booking publik otomatis ter-attribute ke source `slug` untuk tracking. Mounted-guard untuk localStorage (hydration #418 safe).

## 8. Source/Campaign Attribution + Pixel
Setiap pasien/janji temu/booking publik di-tag dengan `source` (meta/google/tiktok/organic/direct). Dashboard analytics menampilkan distribusi sumber pasien, dan event tertentu (BookAppointment, PatientRegistered, DispenseFilled, AppointmentReminder, PublicPageView) di-fire ke Meta Pixel fbq + Google Ads gtag (jika env var di-set). Side-effect: track di local DB juga, sehingga event history tetap tersimpan walau Pixel tidak di-setup.

---

## Stack
- **Framework**: Next.js 16 App Router + TypeScript
- **Styling**: Tailwind CSS 3.4 + custom CSS variables (light/dark)
- **Charts**: Recharts 2.15
- **Icons**: lucide-react
- **PDF**: jsPDF + jspdf-autotable
- **Excel**: xlsx (SheetJS)
- **State**: localStorage + custom event for cross-tab sync
- **I18n**: EN/ID via custom dict + AppProvider context
- **WAHA Integration**: devlikeapro/waha HTTP API

## Routes (12+)
- `/` - Landing page
- `/login` - Sign in
- `/register` - Sign up clinic
- `/dashboard` - KPI overview + Recharts
- `/patients` - Patient registry (CRUD + export)
- `/visits` - Visits (CRUD + dispense)
- `/queue` - Real-time queue board
- `/appointments` - Appointment booking + WAHA reminder
- `/pharmacy` - Medicine stock + dispense
- `/finance` - Auto-journal + manual + chart
- `/analytics` - Source attribution + pixel events
- `/waha` - WAHA server config + send message
- `/settings` - Profile + slug + reset
- `/c/[slug]` - Public clinic page
