"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { getDB, setWahaConfig } from "@/lib/store";
import { sendText } from "@/lib/waha";
import { MessageCircle, Save, Send, Check, X } from "lucide-react";

export default function WahaPage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"connected" | "disconnected" | "unknown">("unknown");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState(lang === "id" ? "Halo, ini pesan dari klinik." : "Hello, this is a message from the clinic.");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  useEffect(() => {
    setUrl(db.wahaUrl);
    setStatus(db.wahaStatus);
  }, [db.wahaUrl, db.wahaStatus]);

  const save = () => {
    setWahaConfig(url, url ? "unknown" : "disconnected");
    setStatus(url ? "unknown" : "disconnected");
  };

  const probe = async () => {
    if (!url) return;
    try {
      const r = await fetch(url.replace(/\/$/, "") + "/api/sessions?all=true", { method: "GET" });
      if (r.ok) {
        setStatus("connected");
        setWahaConfig(url, "connected");
        setFeedback({ ok: true, msg: lang === "id" ? "Server WAHA terhubung." : "WAHA server connected." });
      } else {
        setStatus("disconnected");
        setWahaConfig(url, "disconnected");
        setFeedback({ ok: false, msg: `${lang === "id" ? "HTTP" : "HTTP"} ${r.status}` });
      }
    } catch (e: unknown) {
      setStatus("disconnected");
      setWahaConfig(url, "disconnected");
      const msg = e instanceof Error ? e.message : "network error";
      setFeedback({ ok: false, msg });
    }
  };

  const handleSend = async () => {
    if (!url || !phone || !text) return;
    setSending(true);
    setFeedback(null);
    const r = await sendText(url, phone, text);
    setSending(false);
    if (r.ok) {
      setFeedback({ ok: true, msg: t("messageSent", lang) });
    } else {
      setFeedback({ ok: false, msg: r.detail ?? `HTTP ${r.status}` });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> {t("waha", lang)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lang === "id"
            ? "Konfigurasi server WAHA untuk mengirim pengingat appointment & notifikasi resep ke pasien."
            : "Configure your WAHA server to send appointment reminders and prescription notifications to patients."}
        </p>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-sm">{lang === "id" ? "Konfigurasi Server" : "Server Configuration"}</h3>
        <div>
          <label className="text-xs font-medium block mb-1">{t("wahaUrl", lang)}</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="https://waha.yourdomain.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={save} className="btn btn-primary text-xs">
              <Save className="w-3 h-3" />{t("save", lang)}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{t("wahaStatus", lang)}:</span>
          <span className={`badge ${status === "connected" ? "badge-green" : status === "disconnected" ? "badge-red" : "badge-amber"}`}>
            {status === "connected" ? t("connected", lang) : status === "disconnected" ? t("disconnected", lang) : "Unknown"}
          </span>
          <button onClick={probe} className="btn btn-outline text-xs">
            {lang === "id" ? "Tes Koneksi" : "Test Connection"}
          </button>
        </div>
        {feedback && (
          <div className={`p-2 rounded-md text-xs flex items-center gap-2 ${feedback.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
            {feedback.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {feedback.msg}
          </div>
        )}
        <div className="text-[10px] text-muted-foreground">
          {lang === "id"
            ? "Gunakan server WAHA resmi (devlikeapro/waha). API endpoint: POST /api/sendText dengan body { chatId, text }."
            : "Use official WAHA server (devlikeapro/waha). API endpoint: POST /api/sendText with body { chatId, text }."}
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-sm">{t("sendMessage", lang)}</h3>
        <div>
          <label className="text-xs font-medium block mb-1">{t("recipientPhone", lang)}</label>
          <input
            className="input"
            placeholder="081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t("messageBody", lang)}</label>
          <textarea
            className="input"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button onClick={handleSend} disabled={sending || !url || !phone} className="btn btn-primary text-xs w-full disabled:opacity-50">
          <Send className="w-3 h-3" />{sending ? t("loading", lang) : t("sendMessage", lang)}
        </button>
      </div>
    </div>
  );
}
