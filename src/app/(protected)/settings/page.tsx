"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { resetDB, getDB } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Save, Trash2, ExternalLink, Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const { lang, user, setUser } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicSlug, setClinicSlug] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setClinicName(user.clinicName);
      setClinicSlug(user.clinicSlug);
    }
  }, [user]);

  if (!user) return null;

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/c/${clinicSlug}` : `/c/${clinicSlug}`;

  const save = () => {
    setUser({ ...user, name, clinicName, clinicSlug });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    if (confirm(lang === "id" ? "Reset semua data ke kondisi awal? (Pasien, obat, jurnal akan kembali ke sample data.)" : "Reset all data to initial? (Patients, medicine, journal will reset to sample data.)")) {
      resetDB();
      window.location.reload();
    }
  };

  const copy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("settings", lang)}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "id" ? "Profil klinik, halaman publik, dan data." : "Clinic profile, public page, and data."}
        </p>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-sm">{lang === "id" ? "Profil" : "Profile"}</h3>
        <div>
          <label className="text-xs font-medium block mb-1">{t("fullName", lang)}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t("clinicName", lang)}</label>
          <input className="input" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{lang === "id" ? "Slug Halaman Publik" : "Public Page Slug"}</label>
          <input
            className="input"
            value={clinicSlug}
            onChange={(e) => setClinicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="klinik-sehat"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {lang === "id" ? "URL publik:" : "Public URL:"}{" "}
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {publicUrl} <ExternalLink className="w-3 h-3 inline" />
            </a>
            <button onClick={copy} className="btn btn-ghost text-xs px-2 ml-1">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t("email", lang)}</label>
          <input className="input" value={user.email} disabled />
        </div>
        <button onClick={save} className="btn btn-primary text-xs">
          <Save className="w-3 h-3" />{t("save", lang)}
        </button>
        {saved && <span className="text-emerald-600 text-xs">{lang === "id" ? "Tersimpan!" : "Saved!"}</span>}
      </div>

      <div className="card p-4 space-y-2">
        <h3 className="font-semibold text-sm text-red-600">{lang === "id" ? "Zona Berbahaya" : "Danger Zone"}</h3>
        <p className="text-xs text-muted-foreground">
          {lang === "id" ? "Reset semua data kembali ke sample (pasien, obat, jurnal, antrian)." : "Reset all data back to sample (patients, medicine, journal, queue)."}
        </p>
        <button onClick={reset} className="btn btn-danger text-xs">
          <Trash2 className="w-3 h-3" />{lang === "id" ? "Reset Data" : "Reset Data"}
        </button>
      </div>
    </div>
  );
}
