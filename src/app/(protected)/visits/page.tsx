"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtIDR, fmtDate, fmtDateTime, todayISO, ageFromDOB } from "@/lib/utils";
import { addVisit, updateVisit, dispense, getDB, Visit, trackPixel } from "@/lib/store";
import { Plus, X, Stethoscope, Pill, Download, ChevronRight } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DOCTORS = ["Dr. Ahmad", "Dr. Sari", "Dr. Budi", "Dr. Lina", "Dr. Rudi"];

export default function VisitsPage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Visit | null>(null);

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  const sorted = useMemo(() => [...db.visits].sort((a, b) => b.date.localeCompare(a.date)), [db.visits]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ClinicOS - Visit Report", 14, 16);
    doc.setFontSize(9);
    doc.text(`Generated: ${todayISO()}`, 14, 22);
    autoTable(doc, {
      startY: 26,
      head: [["Date", "Patient", "Doctor", "Diagnosis", "ICD-10", "Fee", "Status"]],
      body: sorted.map((v) => {
        const p = db.patients.find((x) => x.id === v.patientId);
        return [v.date.slice(0, 10), p?.name ?? "?", v.doctor, v.diagnosis, v.icd10, fmtIDR(v.fee), v.status];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 165, 233] },
    });
    doc.save(`clinic-os-visits-${todayISO().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("visits", lang)}</h1>
          <p className="text-sm text-muted-foreground">{sorted.length} {lang === "id" ? "kunjungan" : "visits recorded"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn btn-outline text-xs"><Download className="w-3 h-3" />PDF</button>
          <button onClick={() => setAdding(true)} className="btn btn-primary text-xs"><Plus className="w-3 h-3" />{t("addVisit", lang)}</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">{t("date", lang)}</th>
                <th className="text-left p-3">{lang === "id" ? "Pasien" : "Patient"}</th>
                <th className="text-left p-3 hidden md:table-cell">{t("doctor", lang)}</th>
                <th className="text-left p-3 hidden lg:table-cell">{t("diagnosis", lang)}</th>
                <th className="text-left p-3 hidden lg:table-cell">{t("icd10", lang)}</th>
                <th className="text-right p-3">{t("total", lang)}</th>
                <th className="text-left p-3">{t("status", lang)}</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground text-xs">{t("noVisits", lang)}</td>
                </tr>
              )}
              {sorted.map((v) => {
                const p = db.patients.find((x) => x.id === v.patientId);
                return (
                  <tr key={v.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(v)}>
                    <td className="p-3 text-xs whitespace-nowrap">{fmtDate(v.date)}</td>
                    <td className="p-3">
                      <div className="font-medium">{p?.name ?? "?"}</div>
                      <div className="text-[10px] text-muted-foreground">{p?.mrNumber} · #{v.queueNumber}</div>
                    </td>
                    <td className="p-3 text-xs hidden md:table-cell">{v.doctor}</td>
                    <td className="p-3 text-xs hidden lg:table-cell">{v.diagnosis || "-"}</td>
                    <td className="p-3 text-xs font-mono hidden lg:table-cell">{v.icd10 || "-"}</td>
                    <td className="p-3 text-right text-xs">{fmtIDR(v.fee)}</td>
                    <td className="p-3">
                      <span className={`badge ${v.status === "done" ? "badge-green" : v.status === "cancelled" ? "badge-red" : v.status === "inroom" ? "badge-blue" : "badge-amber"}`}>
                        {v.status === "waiting" ? t("statusWaiting", lang) : v.status === "inroom" ? t("statusInroom", lang) : v.status === "done" ? t("statusDone", lang) : t("statusCancelled", lang)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {adding && <VisitModal onClose={() => setAdding(false)} />}

      {selected && (
        <VisitDetailModal
          visit={selected}
          onClose={() => setSelected(null)}
          onDispense={(items) => {
            dispense(selected.id, selected.patientId, items);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function VisitModal({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [form, setForm] = useState({
    patientId: db.patients[0]?.id ?? "",
    doctor: DOCTORS[0],
    complaint: "",
    diagnosis: "",
    icd10: "",
    treatment: "",
    fee: 150000,
    notes: "",
    bp: "120/80",
    pulse: "80",
    temp: "36.5",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{t("addVisit", lang)}</h2>
          <button onClick={onClose} className="btn btn-ghost text-xs px-2"><X className="w-4 h-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.patientId) return;
            const v = addVisit({
              patientId: form.patientId,
              date: todayISO(),
              doctor: form.doctor,
              complaint: form.complaint,
              diagnosis: form.diagnosis,
              icd10: form.icd10,
              treatment: form.treatment,
              prescription: [],
              vitals: { bp: form.bp, pulse: form.pulse, temp: form.temp },
              fee: form.fee,
              notes: form.notes,
              status: "waiting",
            });
            trackPixel("VisitCreated", db.patients.find((p) => p.id === form.patientId)?.source ?? "organic", form.fee);
            onClose();
          }}
          className="p-4 space-y-3"
        >
          <div>
            <label className="text-xs font-medium block mb-1">{lang === "id" ? "Pasien" : "Patient"} *</label>
            <select required className="input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {db.patients.map((p) => <option key={p.id} value={p.id}>{p.mrNumber} - {p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">{t("doctor", lang)}</label>
              <select className="input" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
                {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("total", lang)} (IDR)</label>
              <input className="input" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{t("complaint", lang)}</label>
            <input className="input" value={form.complaint} onChange={(e) => setForm({ ...form, complaint: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">{t("diagnosis", lang)}</label>
              <input className="input" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("icd10", lang)}</label>
              <input className="input" placeholder="E11.9" value={form.icd10} onChange={(e) => setForm({ ...form, icd10: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{t("treatment", lang)}</label>
            <input className="input" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-medium block mb-1">{t("bp", lang)}</label>
              <input className="input text-xs" value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-medium block mb-1">{t("pulse", lang)}</label>
              <input className="input text-xs" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-medium block mb-1">{t("temp", lang)} (C)</label>
              <input className="input text-xs" value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{t("notes", lang)}</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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

function VisitDetailModal({
  visit,
  onClose,
  onDispense,
}: {
  visit: Visit;
  onClose: () => void;
  onDispense: (items: { medicineId: string; qty: number }[]) => void;
}) {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [showDispense, setShowDispense] = useState(false);
  const [items, setItems] = useState<{ medicineId: string; qty: number }[]>([{ medicineId: "", qty: 1 }]);
  const patient = db.patients.find((p) => p.id === visit.patientId);

  const total = items.reduce((s, it) => {
    const m = db.medicines.find((x) => x.id === it.medicineId);
    return s + (m ? m.price * it.qty : 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              {t("visits", lang)} - {patient?.name ?? "?"}
            </h2>
            <div className="text-[10px] text-muted-foreground">{fmtDateTime(visit.date)} · {visit.doctor}</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost text-xs px-2"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Field label={t("patientId", lang)} value={patient?.mrNumber ?? "-"} />
            <Field label={t("age", lang)} value={`${patient ? ageFromDOB(patient.dob) : "-"}y / ${patient?.gender ?? "-"}`} />
            <Field label={t("complaint", lang)} value={visit.complaint || "-"} />
            <Field label={t("doctor", lang)} value={visit.doctor} />
            <Field label={t("diagnosis", lang)} value={visit.diagnosis || "-"} />
            <Field label={t("icd10", lang)} value={visit.icd10 || "-"} />
            <Field label={t("treatment", lang)} value={visit.treatment || "-"} />
            <Field label={t("vitals", lang)} value={`BP ${visit.vitals.bp} · HR ${visit.vitals.pulse} · ${visit.vitals.temp}C`} />
          </div>

          <div>
            <div className="text-xs font-medium mb-1">{t("status", lang)}</div>
            <div className="flex gap-2">
              {(["waiting", "inroom", "done", "cancelled"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => updateVisit(visit.id, { status: st })}
                  className={`btn text-xs ${visit.status === st ? "btn-primary" : "btn-outline"}`}
                >
                  {st === "waiting" ? t("statusWaiting", lang) : st === "inroom" ? t("statusInroom", lang) : st === "done" ? t("statusDone", lang) : t("statusCancelled", lang)}
                </button>
              ))}
            </div>
          </div>

          {showDispense && (
            <div className="card p-3 bg-muted/30 space-y-2">
              <div className="text-xs font-medium flex items-center gap-1">
                <Pill className="w-3 h-3" /> {t("dispense", lang)}
              </div>
              {items.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    className="input flex-1 text-xs"
                    value={it.medicineId}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], medicineId: e.target.value };
                      setItems(next);
                    }}
                  >
                    <option value="">{lang === "id" ? "Pilih obat" : "Select medicine"}</option>
                    {db.medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - {fmtIDR(m.price)} / {m.unit} (stok: {m.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="input w-20 text-xs"
                    value={it.qty}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], qty: +e.target.value };
                      setItems(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    className="btn btn-ghost text-xs px-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setItems([...items, { medicineId: "", qty: 1 }])}
                className="btn btn-outline text-xs w-full"
              >
                + {lang === "id" ? "Tambah item" : "Add item"}
              </button>
              <div className="flex justify-between text-xs pt-1 border-t">
                <span>{t("total", lang)}</span>
                <span className="font-bold">{fmtIDR(total)}</span>
              </div>
              <button
                onClick={() => {
                  const valid = items.filter((it) => it.medicineId && it.qty > 0);
                  if (valid.length === 0) return;
                  onDispense(valid);
                }}
                disabled={items.every((i) => !i.medicineId)}
                className="btn btn-primary text-xs w-full"
              >
                {t("dispense", lang)} - {fmtIDR(total)}
              </button>
            </div>
          )}

          {!showDispense && (
            <button onClick={() => setShowDispense(true)} className="btn btn-outline w-full text-xs">
              <Pill className="w-3 h-3" /> {t("dispense", lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
