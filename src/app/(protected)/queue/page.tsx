"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtDateTime, todayISO } from "@/lib/utils";
import { enqueue, advanceQueue, cancelQueue, getDB, trackPixel } from "@/lib/store";
import { Plus, X, ChevronRight, RotateCcw } from "lucide-react";

export default function QueuePage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  const today = todayISO().slice(0, 10);
  const todayQueue = useMemo(
    () => db.queue.filter((q) => q.registeredAt.slice(0, 10) === today).sort((a, b) => a.number - b.number),
    [db.queue, today]
  );

  const stats = {
    waiting: todayQueue.filter((q) => q.status === "waiting").length,
    inroom: todayQueue.filter((q) => q.status === "inroom").length,
    done: todayQueue.filter((q) => q.status === "done").length,
    cancelled: todayQueue.filter((q) => q.status === "cancelled").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("queue", lang)}</h1>
          <p className="text-sm text-muted-foreground">
            {lang === "id" ? "Antrian hari ini, real-time." : "Today's queue, real-time."}
          </p>
        </div>
        <button onClick={() => setAdding(true)} className="btn btn-primary text-xs">
          <Plus className="w-3 h-3" />{lang === "id" ? "Tambah Antrian" : "Add to Queue"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatBox label={t("waiting", lang)} value={stats.waiting} color="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
        <StatBox label={t("inRoom", lang)} value={stats.inroom} color="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
        <StatBox label={t("done", lang)} value={stats.done} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" />
        <StatBox label={t("cancelled", lang)} value={stats.cancelled} color="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" />
      </div>

      <div className="card p-4">
        {todayQueue.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("noQueue", lang)}
          </div>
        ) : (
          <div className="space-y-2">
            {todayQueue.map((q) => {
              const p = db.patients.find((x) => x.id === q.patientId);
              return (
                <div key={q.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  q.status === "inroom" ? "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20" :
                  q.status === "done" ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20" :
                  q.status === "cancelled" ? "border-red-200 bg-red-50/30 opacity-60 dark:bg-red-950/20" :
                  "border-amber-200 bg-amber-50/30 dark:bg-amber-950/20"
                }`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                    q.status === "inroom" ? "bg-blue-500 text-white" :
                    q.status === "done" ? "bg-emerald-500 text-white" :
                    q.status === "cancelled" ? "bg-red-400 text-white" :
                    "bg-amber-500 text-white"
                  }`}>
                    {q.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p?.name ?? "?"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {p?.mrNumber} · {fmtDateTime(q.registeredAt)} · {q.estimatedMinutes}min · <span className="badge badge-amber">{q.source}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {q.status === "waiting" && (
                      <button
                        onClick={() => advanceQueue(q.id)}
                        className="btn btn-primary text-xs"
                      >
                        {t("callNext", lang)} <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                    {q.status === "inroom" && (
                      <button
                        onClick={() => advanceQueue(q.id)}
                        className="btn btn-primary text-xs"
                      >
                        {t("completeVisit", lang)} <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                    {q.status === "done" && (
                      <span className="badge badge-green">{t("done", lang)}</span>
                    )}
                    {q.status === "cancelled" && (
                      <span className="badge badge-red">{t("cancelled", lang)}</span>
                    )}
                    {q.status !== "cancelled" && q.status !== "done" && (
                      <button
                        onClick={() => cancelQueue(q.id)}
                        className="btn btn-ghost text-xs text-red-600"
                        title={t("cancelled", lang)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {adding && <EnqueueModal onClose={() => setAdding(false)} />}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`p-3 rounded-lg ${color} text-center`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

function EnqueueModal({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [form, setForm] = useState({ patientId: db.patients[0]?.id ?? "", source: "organic" });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{lang === "id" ? "Tambah ke Antrian" : "Add to Queue"}</h2>
          <button onClick={onClose} className="btn btn-ghost text-xs px-2"><X className="w-4 h-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.patientId) return;
            enqueue(form.patientId, form.source);
            trackPixel("PatientEnqueued", form.source);
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
            <button type="submit" className="btn btn-primary flex-1">{t("add", lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
