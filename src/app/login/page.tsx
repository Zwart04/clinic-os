"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp, getStoredUsers } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { Stethoscope, Globe, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, setUser } = useApp();
  const [email, setEmail] = useState("demo@clinic-os.local");
  const [password, setPassword] = useState("demo1234");
  const [err, setErr] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr(lang === "id" ? "Email dan kata sandi wajib diisi." : "Email and password are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr(lang === "id" ? "Format email tidak valid." : "Invalid email format.");
      return;
    }
    if (password.length < 6) {
      setErr(lang === "id" ? "Kata sandi minimal 6 karakter." : "Password must be at least 6 characters.");
      return;
    }

    const users = getStoredUsers();
    const existing = users.find((u) => u.email === email);

    if (existing) {
      if (existing.password !== password) {
        setErr(lang === "id" ? "Kata sandi salah." : "Wrong password.");
        return;
      }
      setUser({ email: existing.email, name: existing.name, clinicName: existing.clinicName, clinicSlug: existing.clinicSlug });
    } else {
      // Auto-register as demo for unknown email (since this is local-first)
      const u = {
        email,
        password,
        name: email.split("@")[0],
        clinicName: lang === "id" ? "Klinik Saya" : "My Clinic",
        clinicSlug: (email.split("@")[0] || "klinik").toLowerCase().replace(/[^a-z0-9]/g, "-"),
      };
      const next = [...users, u];
      window.localStorage.setItem("co_users", JSON.stringify(next));
      setUser({ email: u.email, name: u.name, clinicName: u.clinicName, clinicSlug: u.clinicSlug });
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold">{t("appName", lang)}</div>
              <div className="text-[10px] text-muted-foreground">{t("tagline", lang)}</div>
            </div>
          </Link>
          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="btn btn-outline text-xs"
          >
            <Globe className="w-3 h-3" /> {lang.toUpperCase()}
          </button>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold mb-1">{t("signIn", lang)}</h1>
          <p className="text-sm text-muted-foreground mb-5">
            {lang === "id" ? "Masuk untuk melanjutkan ke dashboard klinik." : "Sign in to continue to your clinic dashboard."}
          </p>

          {err && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1">{t("email", lang)}</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@klinik.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("password", lang)}</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              {t("signIn", lang)}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center text-xs text-muted-foreground">
            {t("noAccount", lang)}{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              {t("register", lang)}
            </Link>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-md text-[10px] text-muted-foreground">
            {lang === "id"
              ? "Demo: email apapun dengan password ≥6 karakter akan otomatis terdaftar."
              : "Demo: any email with password ≥6 chars will auto-register."}
          </div>
        </div>
      </div>
    </div>
  );
}
