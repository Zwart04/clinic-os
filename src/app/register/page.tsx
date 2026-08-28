"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp, getStoredUsers } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { Stethoscope, Globe, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { lang, setLang, setUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email || !password || !clinicName || !name) {
      setErr(lang === "id" ? "Semua field wajib diisi." : "All fields are required.");
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
    if (users.find((u) => u.email === email)) {
      setErr(lang === "id" ? "Email sudah terdaftar." : "Email already registered.");
      return;
    }
    const slug = clinicName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "klinik";
    const u = { email, password, name, clinicName, clinicSlug: slug };
    window.localStorage.setItem("co_users", JSON.stringify([...users, u]));
    setUser({ email: u.email, name: u.name, clinicName: u.clinicName, clinicSlug: u.clinicSlug });
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
          <button onClick={() => setLang(lang === "id" ? "en" : "id")} className="btn btn-outline text-xs">
            <Globe className="w-3 h-3" /> {lang.toUpperCase()}
          </button>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold mb-1">{t("signUp", lang)}</h1>
          <p className="text-sm text-muted-foreground mb-5">
            {lang === "id" ? "Daftarkan klinik Anda, gratis selamanya." : "Register your clinic, free forever."}
          </p>

          {err && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1">{t("fullName", lang)}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Ahmad" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("clinicName", lang)}</label>
              <input className="input" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Klinik Sehat Sentosa" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("email", lang)}</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@klinik.com" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("password", lang)}</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              {t("signUp", lang)}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center text-xs text-muted-foreground">
            {t("haveAccount", lang)}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t("login", lang)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
