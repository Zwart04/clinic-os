// i18n dict (Indonesian + English)
export type Lang = "id" | "en";

export const dict = {
  // App
  appName: { id: "ClinicOS", en: "ClinicOS" },
  tagline: {
    id: "Sistem Operasi Klinik & Apotek",
    en: "Clinic & Pharmacy OS",
  },

  // Nav
  dashboard: { id: "Dasbor", en: "Dashboard" },
  patients: { id: "Pasien", en: "Patients" },
  visits: { id: "Kunjungan", en: "Visits" },
  queue: { id: "Antrian", en: "Queue" },
  appointments: { id: "Janji Temu", en: "Appointments" },
  pharmacy: { id: "Apotek", en: "Pharmacy" },
  finance: { id: "Keuangan", en: "Finance" },
  analytics: { id: "Analitik", en: "Analytics" },
  waha: { id: "WhatsApp", en: "WhatsApp" },
  settings: { id: "Pengaturan", en: "Settings" },
  publicPage: { id: "Halaman Publik", en: "Public Page" },

  // Auth
  login: { id: "Masuk", en: "Sign in" },
  register: { id: "Daftar", en: "Register" },
  logout: { id: "Keluar", en: "Sign out" },
  email: { id: "Email", en: "Email" },
  password: { id: "Kata Sandi", en: "Password" },
  clinicName: { id: "Nama Klinik", en: "Clinic Name" },
  signIn: { id: "Masuk", en: "Sign in" },
  signUp: { id: "Buat Akun", en: "Create Account" },
  noAccount: { id: "Belum punya akun?", en: "Don't have an account?" },
  haveAccount: { id: "Sudah punya akun?", en: "Already have an account?" },

  // Common
  save: { id: "Simpan", en: "Save" },
  cancel: { id: "Batal", en: "Cancel" },
  delete: { id: "Hapus", en: "Delete" },
  edit: { id: "Ubah", en: "Edit" },
  add: { id: "Tambah", en: "Add" },
  search: { id: "Cari", en: "Search" },
  filter: { id: "Saring", en: "Filter" },
  export: { id: "Ekspor", en: "Export" },
  print: { id: "Cetak", en: "Print" },
  loading: { id: "Memuat...", en: "Loading..." },
  confirm: { id: "Konfirmasi", en: "Confirm" },
  yes: { id: "Ya", en: "Yes" },
  no: { id: "Tidak", en: "No" },
  all: { id: "Semua", en: "All" },
  today: { id: "Hari Ini", en: "Today" },
  thisWeek: { id: "Minggu Ini", en: "This Week" },
  thisMonth: { id: "Bulan Ini", en: "This Month" },
  actions: { id: "Aksi", en: "Actions" },
  status: { id: "Status", en: "Status" },
  date: { id: "Tanggal", en: "Date" },
  notes: { id: "Catatan", en: "Notes" },
  total: { id: "Total", en: "Total" },
  name: { id: "Nama", en: "Name" },
  phone: { id: "Telepon", en: "Phone" },
  address: { id: "Alamat", en: "Address" },
  category: { id: "Kategori", en: "Category" },

  // Patient
  addPatient: { id: "Tambah Pasien", en: "Add Patient" },
  patientId: { id: "No. RM", en: "Medical Record" },
  fullName: { id: "Nama Lengkap", en: "Full Name" },
  dob: { id: "Tanggal Lahir", en: "Date of Birth" },
  gender: { id: "Jenis Kelamin", en: "Gender" },
  male: { id: "Laki-laki", en: "Male" },
  female: { id: "Perempuan", en: "Female" },
  age: { id: "Umur", en: "Age" },
  allergies: { id: "Alergi", en: "Allergies" },
  bpjs: { id: "BPJS", en: "BPJS" },
  general: { id: "Umum", en: "General" },
  insurance: { id: "Asuransi", en: "Insurance" },

  // Visit
  addVisit: { id: "Tambah Kunjungan", en: "Add Visit" },
  doctor: { id: "Dokter", en: "Doctor" },
  complaint: { id: "Keluhan", en: "Chief Complaint" },
  diagnosis: { id: "Diagnosis", en: "Diagnosis" },
  icd10: { id: "Kode ICD-10", en: "ICD-10 Code" },
  treatment: { id: "Tindakan", en: "Treatment" },
  prescription: { id: "Resep", en: "Prescription" },
  vitals: { id: "Tanda Vital", en: "Vitals" },
  bp: { id: "Tekanan Darah", en: "Blood Pressure" },
  pulse: { id: "Nadi", en: "Pulse" },
  temp: { id: "Suhu", en: "Temperature" },
  statusWaiting: { id: "Menunggu", en: "Waiting" },
  statusInroom: { id: "Di Ruang", en: "In Room" },
  statusDone: { id: "Selesai", en: "Done" },
  statusCancelled: { id: "Dibatalkan", en: "Cancelled" },

  // Queue
  queueNumber: { id: "No. Antrian", en: "Queue No." },
  waiting: { id: "Menunggu", en: "Waiting" },
  inRoom: { id: "Di Ruang", en: "In Room" },
  done: { id: "Selesai", en: "Done" },
  cancelled: { id: "Dibatalkan", en: "Cancelled" },
  callNext: { id: "Panggil Berikutnya", en: "Call Next" },
  startVisit: { id: "Mulai Kunjungan", en: "Start Visit" },
  completeVisit: { id: "Selesaikan", en: "Complete" },

  // Appointment
  bookAppointment: { id: "Buat Janji", en: "Book Appointment" },
  appointmentTime: { id: "Waktu", en: "Time" },
  sendReminder: { id: "Kirim Pengingat", en: "Send Reminder" },
  reminderSent: { id: "Pengingat Terkirim", en: "Reminder Sent" },
  appointmentBooked: { id: "Janji Dibuat", en: "Appointment Booked" },
  publicBooking: { id: "Booking Publik", en: "Public Booking" },

  // Pharmacy
  addMedicine: { id: "Tambah Obat", en: "Add Medicine" },
  medicineName: { id: "Nama Obat", en: "Medicine Name" },
  stock: { id: "Stok", en: "Stock" },
  minStock: { id: "Stok Minimum", en: "Min Stock" },
  price: { id: "Harga", en: "Price" },
  cost: { id: "Modal", en: "Cost" },
  batch: { id: "Batch", en: "Batch" },
  expDate: { id: "Tgl Kadaluarsa", en: "Exp. Date" },
  lowStock: { id: "Stok Rendah", en: "Low Stock" },
  dispense: { id: "Dispense", en: "Dispense" },
  dispensed: { id: "Terdispense", en: "Dispensed" },

  // Finance
  income: { id: "Pendapatan", en: "Income" },
  expense: { id: "Pengeluaran", en: "Expense" },
  profit: { id: "Laba", en: "Profit" },
  source: { id: "Sumber", en: "Source" },
  autoVisit: { id: "Auto: Kunjungan", en: "Auto: Visit" },
  autoDispense: { id: "Auto: Apotek", en: "Auto: Dispense" },
  autoStock: { id: "Auto: Stok Masuk", en: "Auto: Stock In" },
  journal: { id: "Jurnal", en: "Journal" },

  // Public
  bookNow: { id: "Pesan Sekarang", en: "Book Now" },
  ourDoctors: { id: "Dokter Kami", en: "Our Doctors" },
  ourServices: { id: "Layanan Kami", en: "Our Services" },
  viewSchedule: { id: "Lihat Jadwal", en: "View Schedule" },
  bookAppointmentPublic: { id: "Buat Janji Temu", en: "Book Appointment" },

  // Empty / errors
  noPatients: { id: "Belum ada pasien. Tambahkan pasien pertama Anda.", en: "No patients yet. Add your first patient." },
  noVisits: { id: "Belum ada kunjungan.", en: "No visits recorded." },
  noAppointments: { id: "Belum ada janji temu.", en: "No appointments scheduled." },
  noMedicine: { id: "Belum ada obat. Tambahkan stok pertama.", en: "No medicine yet. Add first stock." },
  noQueue: { id: "Antrian kosong.", en: "Queue is empty." },
  noTransactions: { id: "Belum ada transaksi.", en: "No transactions yet." },

  // WAHA
  wahaUrl: { id: "URL Server WAHA", en: "WAHA Server URL" },
  wahaStatus: { id: "Status Koneksi", en: "Connection Status" },
  connected: { id: "Terhubung", en: "Connected" },
  disconnected: { id: "Tidak Terhubung", en: "Disconnected" },
  sendMessage: { id: "Kirim Pesan", en: "Send Message" },
  recipientPhone: { id: "No. HP Tujuan", en: "Recipient Phone" },
  messageBody: { id: "Isi Pesan", en: "Message Body" },
  messageSent: { id: "Pesan Terkirim", en: "Message Sent" },

  // Landing
  heroTitle: { id: "Klinik Anda, Sepenuhnya Digital.", en: "Your clinic, fully digital." },
  heroSubtitle: {
    id: "Catat pasien, antrian, resep, stok obat, dan keuangan dalam satu aplikasi. Pasien baru bisa pesan janji temu lewat halaman publik Anda.",
    en: "Track patients, queues, prescriptions, medicine stock, and finances in one app. New patients can book appointments through your public page.",
  },
  getStarted: { id: "Mulai Sekarang", en: "Get Started" },
  viewDemo: { id: "Lihat Demo Publik", en: "View Public Demo" },

  featurePatient: { id: "Registrasi Pasien", en: "Patient Registry" },
  featureQueue: { id: "Antrian Real-time", en: "Real-time Queue" },
  featurePharma: { id: "Apotek & Stok", en: "Pharmacy & Stock" },
  featureFinance: { id: "Auto-Jurnal Keuangan", en: "Auto-Finance Journal" },
  featurePublic: { id: "Halaman Publik Klinik", en: "Public Clinic Page" },
  featureAnalytics: { id: "Analitik & Pixel", en: "Analytics & Pixel" },
  featureReminder: { id: "Pengingat WhatsApp", en: "WhatsApp Reminder" },
  featureExport: { id: "Ekspor PDF / Excel", en: "Export PDF / Excel" },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key]?.[lang] ?? key;
}
