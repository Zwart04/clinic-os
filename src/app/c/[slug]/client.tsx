"use client";

import { useEffect, useState, use } from "react";
import { CalendarCheck, Clock, MapPin, Phone, Stethoscope, Globe, ArrowRight, Check } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { addAppointment, trackPixel } from "@/lib/store";

const DOCTORS = [
  { name: "Dr. Ahmad", specialty: "Penyakit Dalam", schedule: "Senin-Jumat 08:00-12:00" },
  { name: "Dr. Sari", specialty: "Anak", schedule: "Senin-Sabtu 09:00-13:00" },
  { name: "Dr. Budi", specialty: "Bedah Umum", schedule: "Selasa & Kamis 14:00-17:00" },
  { name: "Dr. Lina", specialty: "Kulit & Kecantikan", schedule: "Senin-Jumat 15:00-19:00" },
  { name: "Dr. Rudi", specialty: "Gigi", schedule: "Senin-Sabtu 10:00-14:00" },
];

const SERVICES = [
  { name: { id: "Konsultasi Umum", en: "General Consultation" }, duration: "30 min", price: "Rp 150.000" },
  { name: { id: "Pemeriksaan Anak", en: "Pediatric Check" }, duration: "30 min", price: "Rp 175.000" },
  { name: { id: "Konsultasi Kulit", en: "Skin Consultation" }, duration: "45 min", price: "Rp 250.000" },
  { name: { id: "Vaksinasi", en: "Vaccination" }, duration: "20 min", price: "Rp 100.000" },
  { name: { id: "Cek Darah Lengkap", en: "Complete Blood Count" }, duration: "15 min", price: "Rp 80.000" },
  { name: { id: "Scaling Gigi", en: "Dental Scaling" }, duration: "45 min", price: "Rp 300.000" },
];

export default function PublicClinicClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { lang, toggleLang, mounted } = useApp();
  const [clinicName, setClinicName] = useState("Klinik Sehat Sentosa");
  const [booked, setBooked] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    doctor: DOCTORS[0].name,
    date: "",
    reason: "",
  });

  // mounted guard - read clinic config from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    try {
      const userRaw = window.localStorage.getItem("co_user");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.clinicSlug === slug) {
          setClinicName(u.clinicName);
        }
      }
    } catch {
      // noop
    }
    // Track pageview pixel
    trackPixel("PublicPageView", "organic");
  }, [mounted, slug]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) return;
    addAppointment({
      patientId: `ext_${Date.now()}`,
      patientName: form.name,
      patientPhone: form.phone,
      doctor: form.doctor,
      date: new Date(form.date).toISOString(),
      duration: 30,
      reason: form.reason,
      source: slug,
      notes: "",
    });
    trackPixel("BookAppointmentPublic", slug, undefined, { clinic: slug });
    setBooked(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900">
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold">{mounted ? clinicName : t("appName", lang)}</div>
              <div className="text-[10px] text-muted-foreground">{t("tagline", lang)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="btn btn-outline text-xs">
              <Globe className="w-3 h-3" />{lang.toUpperCase()}
            </button>
            <a href="#booking" className="btn btn-primary text-xs">
              {t("bookNow", lang)} <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-medium">
            <Check className="w-3 h-3" /> {lang === "id" ? "Terdaftar & Terpercaya" : "Registered & Trusted"}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold">{mounted ? clinicName : "Klinik Sehat Sentosa"}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {lang === "id"
              ? "Layanan kesehatan profesional dengan dokter berpengalaman. Buat janji temu online, praktis dan cepat."
              : "Professional healthcare with experienced doctors. Book appointments online, easy and fast."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <a href="#booking" className="btn btn-primary">
              <CalendarCheck className="w-4 h-4" />{t("bookNow", lang)}
            </a>
            <a href="#services" className="btn btn-outline">{t("ourServices", lang)}</a>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">{t("ourDoctors", lang)}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {DOCTORS.map((d) => (
            <div key={d.name} className="card p-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white flex items-center justify-center text-lg font-bold mb-2">
                {d.name.split(" ")[1]?.[0] ?? d.name[0]}
              </div>
              <div className="font-semibold">{d.name}</div>
              <div className="text-xs text-muted-foreground mb-2">{d.specialty}</div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />{d.schedule}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">{t("ourServices", lang)}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICES.map((s) => (
            <div key={JSON.stringify(s.name)} className="card p-4">
              <div className="font-semibold mb-1">{s.name[lang]}</div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
                <span className="font-medium text-primary">{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="max-w-3xl mx-auto px-4 py-12">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-1">{t("bookAppointmentPublic", lang)}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {lang === "id" ? "Isi form di bawah, tim kami akan konfirmasi via WhatsApp." : "Fill the form below, our team will confirm via WhatsApp."}
          </p>
          {booked ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-1">{t("appointmentBooked", lang)}</h3>
              <p className="text-sm text-muted-foreground">
                {lang === "id" ? "Kami akan menghubungi Anda segera." : "We will contact you shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">{t("fullName", lang)} *</label>
                  <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">{t("phone", lang)} *</label>
                  <input required className="input" placeholder="081234567890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">{t("doctor", lang)}</label>
                  <select className="input" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
                    {DOCTORS.map((d) => <option key={d.name} value={d.name}>{d.name} - {d.specialty}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">{t("appointmentTime", lang)} *</label>
                  <input required className="input" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">{lang === "id" ? "Alasan" : "Reason"}</label>
                <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={lang === "id" ? "Konsultasi umum, cek darah, dll." : "General consultation, blood test, etc."} />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                {t("bookNow", lang)} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lang === "id" ? "Jl. Merdeka No. 12, Jakarta" : "12 Merdeka St, Jakarta"}</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />+62 21 1234 5678</span>
          </div>
          <div>© 2026 {mounted ? clinicName : "Klinik Sehat Sentosa"}. Powered by ClinicOS.</div>
        </div>
      </footer>
    </div>
  );
}
