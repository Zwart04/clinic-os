"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtDate, fmtDateTime, todayISO } from "@/lib/utils";
import { addAppointment, updateAppointment, markReminderSent, getDB, trackPixel } from "@/lib/store";
import { sendText, reminderTemplate } from "@/lib/waha";
import { Plus, X, MessageCircle, Check, Trash2 } from "lucide-react";

const DOCTORS = ["Dr. Ahmad", "Dr. Sari", "Dr. Budi", "Dr. Lina", "Dr. Rudi"];

export default function AppointmentsPage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  const sorted = [...db.appointments].sort((a, b) => a.date.localeCompare(b.date));

  const sendReminder = async (id: string) => {
    const appt = db.appointments.find((a) => a.id === id);
    if (!appt) return;
    if (!db.wahaUrl) {
      alert(lang === "id" ? "Set URL WAHA dulu di tab WhatsApp" : "Set WAHA URL first in WhatsApp tab");
      return;
    }
    const msg = reminderTemplate(appt.patientName, appt.doctor, appt.date);
    const r = await sendText(db.wahaUrl, appt.patientPhone, msg);
    if (r.ok) {
      markReminderSent(id);
      alert(lang === "id" ? "Pengingat terkirim!" : "Reminder sent!");
    } else {
      alert(`${lang === "id" ? "Gagal kirim" : "Failed"}: ${r.detail ?? r.status}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("appointments", lang)}</h1>
          <p className="text-sm text-muted-foreground">{sorted.length} {lang === "id" ? "janji temu" : "appointments"}</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn btn-primary text-xs">
          <Plus className="w-3 h-3" />{t("bookAppointment", lang)}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">{t("date", lang)}</th>
                <th className="text-left p-3">{lang === "id" ? "Pasien" : "Patient"}</th>
                <th className="text-left p-3 hidden md:table-cell">{t("phone", lang)}</th>
                <th className="text-left p-3 hidden md:table-cell">{t("doctor", lang)}</th>
                <th className="text-left p-3 hidden lg:table-cell">{lang === "id" ? "Alasan" : "Reason"}</th>
                <th className="text-left p-3">{t("status", lang)}</th>
                <th className="text-right p-3">{t("actions", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground text-xs">{t("noAppointments", lang)}</td>
                </tr>
              )}
              {sorted.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3 text-xs whitespace-nowrap">{fmtDateTime(a.date)}</td>
                  <td className="p-3 font-medium">{a.patientName}</td>
                  <td className="p-3 text-xs hidden md:table-cell">{a.patientPhone}</td>
                  <td className="p-3 text-xs hidden md:table-cell">{a.doctor}</td>
                  <td className="p-3 text-xs hidden lg:table-cell">{a.reason}</td>
                  <td className="p-3">
                    <span className={`badge ${a.status === "done" ? "badge-green" : a.status === "cancelled" ? "badge-red" : a.status === "confirmed" ? "badge-blue" : "badge-amber"}`}>
                      {a.status}
                    </span>
                    {a.reminderSent && (
                      <span className="badge badge-green ml-1">WA</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => sendReminder(a.id)}
                        disabled={a.reminderSent || a.status === "cancelled"}
                        className="btn btn-ghost text-xs px-2 disabled:opacity-30"
                        title={t("sendReminder", lang)}
                      >
                        <MessageCircle className="w-3 h-3" />
                      </button>
                      {a.status === "scheduled" && (
                        <button
                          onClick={() => updateAppointment(a.id, { status: "confirmed" })}
                          className="btn btn-ghost text-xs px-2"
                          title={lang === "id" ? "Konfirmasi" : "Confirm"}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      {a.status === "confirmed" && (
                        <button
                          onClick={() => updateAppointment(a.id, { status: "done" })}
                          className="btn btn-ghost text-xs px-2 text-emerald-600"
                          title={lang === "id" ? "Selesai" : "Done"}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      {a.status !== "done" && a.status !== "cancelled" && (
                        <button
                          onClick={() => updateAppointment(a.id, { status: "cancelled" })}
                          className="btn btn-ghost text-xs px-2 text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adding && <ApptModal onClose={() => setAdding(false)} />}
    </div>
  );
}

function ApptModal({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [form, setForm] = useState({
    patientId: db.patients[0]?.id ?? "",
    doctor: DOCTORS[0],
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    duration: 30,
    reason: "",
    source: "organic",
  });
  const selected = db.patients.find((p) => p.id === form.patientId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{t("bookAppointment", lang)}</h2>
          <button onClick={onClose} className="btn btn-ghost text-xs px-2"><X className="w-4 h-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.patientId) return;
            addAppointment({
              patientId: form.patientId,
              patientName: selected?.name ?? "",
              patientPhone: selected?.phone ?? "",
              doctor: form.doctor,
              date: new Date(form.date).toISOString(),
              duration: form.duration,
              reason: form.reason,
              source: form.source,
              notes: "",
            });
            trackPixel("BookAppointment", form.source);
            onClose();
          }}
          className="p-4 space-y-3"
        >
          <div>
            <label className="text-xs font-medium block mb-1">{lang === "id" ? "Pasien" : "Patient"}</label>
            <select className="input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {db.patients.map((p) => <option key={p.id} value={p.id}>{p.mrNumber} - {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{t("doctor", lang)}</label>
            <select className="input" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
              {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium block mb-1">{t("appointmentTime", lang)}</label>
              <input className="input" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{lang === "id" ? "Durasi (mnt)" : "Duration (min)"}</label>
              <input className="input" type="number" min={15} step={15} value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{lang === "id" ? "Alasan" : "Reason"}</label>
            <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{t("source", lang)}</label>
            <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              <option value="organic">organic</option>
              <option value="meta">meta</option>
              <option value="google">google</option>
              <option value="tiktok">tiktok</option>
              <option value="direct">direct</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">{t("cancel", lang)}</button>
            <button type="submit" className="btn btn-primary flex-1">{t("save", lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
