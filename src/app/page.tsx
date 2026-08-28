"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { Activity, Users, Pill, Wallet, Globe, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { lang, toggleLang, mounted } = useApp();

  useEffect(() => {
    if (!mounted) return;
    const userRaw = window.localStorage.getItem("co_user");
    if (userRaw) {
      router.replace("/dashboard");
    }
  }, [mounted, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">C+</div>
            <div>
              <div className="font-semibold">{t("appName", lang)}</div>
              <div className="text-[10px] text-muted-foreground">{t("tagline", lang)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="btn btn-outline text-xs">
              <Globe className="w-3 h-3" />{lang.toUpperCase()}
            </button>
            <Link href="/login" className="btn btn-primary text-xs">{t("login", lang)}</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              {lang === "id" ? "Untuk klinik, apotek & praktik kecil" : "For clinics, pharmacies & small practices"}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {t("heroTitle", lang)}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t("heroSubtitle", lang)}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-primary">
                {t("getStarted", lang)} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/c/klinik-sehat" target="_blank" className="btn btn-outline">
                {t("viewDemo", lang)}
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
              <div>✓ 100% local-first</div>
              <div>✓ Bilingual EN/ID</div>
              <div>✓ WhatsApp integration</div>
              <div>✓ Free forever</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title={t("featurePatient", lang)}
              bg="from-sky-500 to-sky-600"
            />
            <FeatureCard
              icon={<Activity className="w-5 h-5" />}
              title={t("featureQueue", lang)}
              bg="from-emerald-500 to-emerald-600"
            />
            <FeatureCard
              icon={<Pill className="w-5 h-5" />}
              title={t("featurePharma", lang)}
              bg="from-violet-500 to-violet-600"
            />
            <FeatureCard
              icon={<Wallet className="w-5 h-5" />}
              title={t("featureFinance", lang)}
              bg="from-amber-500 to-amber-600"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">
          {lang === "id" ? "Yang Anda dapatkan" : "What you get"}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: t("featurePatient", lang), d: lang === "id" ? "No. RM otomatis, alergi, BPJS/asuransi, segmentasi sumber." : "Auto MR number, allergies, BPJS/insurance, source segmentation." },
            { t: t("featureQueue", lang), d: lang === "id" ? "Panggil pasien, status real-time, estimasi waktu." : "Call patients, real-time status, time estimates." },
            { t: t("featurePharma", lang), d: lang === "id" ? "Stok, batch, exp date, alert rendah, dispense on prescription." : "Stock, batch, exp date, low-stock alerts, dispense on prescription." },
            { t: t("featureFinance", lang), d: lang === "id" ? "Otomatis catat pendapatan kunjungan & apotek ke jurnal." : "Auto-log visit & pharmacy revenue to journal." },
            { t: t("featurePublic", lang), d: lang === "id" ? "Halaman publik klinik + booking janji temu." : "Public clinic page + appointment booking." },
            { t: t("featureAnalytics", lang), d: lang === "id" ? "Recharts + Meta Pixel + GA4 untuk tracking sumber." : "Recharts + Meta Pixel + GA4 source tracking." },
          ].map((f, i) => (
            <div key={i} className="card p-5">
              <div className="font-semibold mb-1.5">{f.t}</div>
              <div className="text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© 2026 ClinicOS. {lang === "id" ? "Open source" : "Open source"} MIT.</div>
          <div>
            <Link href="/c/klinik-sehat" className="hover:underline">{t("publicPage", lang)}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, bg }: { icon: React.ReactNode; title: string; bg: string }) {
  return (
    <div className={`bg-gradient-to-br ${bg} text-white rounded-xl p-5 aspect-square flex flex-col justify-between`}>
      <div className="opacity-90">{icon}</div>
      <div className="font-semibold text-sm">{title}</div>
    </div>
  );
}
