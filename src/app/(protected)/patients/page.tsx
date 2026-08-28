"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtDate, ageFromDOB, uid, todayISO } from "@/lib/utils";
import { addPatient, updatePatient, deletePatient, getDB, Patient, PatientCategory, trackPixel } from "@/lib/store";
import { Plus, Search, Edit2, Trash2, X, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function PatientsPage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<PatientCategory | "all">("all");
  const [editing, setEditing] = useState<Patient | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  const filtered = useMemo(() => {
    return db.patients.filter((p) => {
      const s = search.toLowerCase();
      const matchSearch = !s || p.name.toLowerCase().includes(s) || p.mrNumber.toLowerCase().includes(s) || p.phone.includes(s);
      const matchCat = filterCat === "all" || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [db.patients, search, filterCat]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((p) => ({
        "No RM": p.mrNumber,
        Nama: p.name,
        Gender: p.gender,
        DOB: p.dob,
        Umur: ageFromDOB(p.dob),
        Phone: p.phone,
        Alamat: p.address,
        Alergi: p.allergies,
        Kategori: p.category,
        Source: p.source,
        Catatan: p.notes,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, `clinic-os-patients-${todayISO().slice(0, 10)}.xlsx`);
    trackPixel("ExportExcel", "in-app", filtered.length, { type: "patients" });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ClinicOS - Patient List", 14, 16);
    doc.setFontSize(9);
    doc.text(`Generated: ${todayISO()}`, 14, 22);
    autoTable(doc, {
      startY: 26,
      head: [["No RM", "Name", "Gender", "Age", "Phone", "Category", "Source"]],
      body: filtered.map((p) => [p.mrNumber, p.name, p.gender, ageFromDOB(p.dob), p.phone, p.category, p.source]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 165, 233] },
    });
    doc.save(`clinic-os-patients-${todayISO().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("patients", lang)}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} {lang === "id" ? "pasien" : "patients"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportExcel} className="btn btn-outline text-xs"><Download className="w-3 h-3" />Excel</button>
          <button onClick={exportPDF} className="btn btn-outline text-xs"><Download className="w-3 h-3" />PDF</button>
          <button onClick={() => setAdding(true)} className="btn btn-primary text-xs"><Plus className="w-3 h-3" />{t("addPatient", lang)}</button>
        </div>
      </div>

      <div className="card p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="input pl-8"
            placeholder={t("search", lang) + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input md:w-40" value={filterCat} onChange={(e) => setFilterCat(e.target.value as PatientCategory | "all")}>
          <option value="all">{t("all", lang)}</option>
          <option value="umum">{t("general", lang)}</option>
          <option value="bpjs">{t("bpjs", lang)}</option>
          <option value="asuransi">{t("insurance", lang)}</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">{t("patientId", lang)}</th>
                <th className="text-left p-3">{t("name", lang)}</th>
                <th className="text-left p-3 hidden sm:table-cell">{t("age", lang)} / {t("gender", lang)}</th>
                <th className="text-left p-3 hidden md:table-cell">{t("phone", lang)}</th>
                <th className="text-left p-3">{t("category", lang)}</th>
                <th className="text-left p-3 hidden lg:table-cell">{t("source", lang)}</th>
                <th className="text-right p-3">{t("actions", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground text-xs">{t("noPatients", lang)}</td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{p.mrNumber}</td>
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground sm:hidden">{ageFromDOB(p.dob)}y / {p.gender} · {p.phone}</div>
                  </td>
                  <td className="p-3 text-xs hidden sm:table-cell">{ageFromDOB(p.dob)}y / {p.gender}</td>
                  <td className="p-3 text-xs hidden md:table-cell">{p.phone}</td>
                  <td className="p-3">
                    <span className={`badge ${p.category === "bpjs" ? "badge-blue" : p.category === "asuransi" ? "badge-purple" : "badge-gray"}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <span className="badge badge-amber">{p.source}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(p)} className="btn btn-ghost text-xs px-2"><Edit2 className="w-3 h-3" /></button>
                      <button
                        onClick={() => {
                          if (confirm(lang === "id" ? `Hapus ${p.name}?` : `Delete ${p.name}?`)) deletePatient(p.id);
                        }}
                        className="btn btn-ghost text-xs px-2 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <PatientModal
          patient={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) {
              updatePatient(editing.id, data);
            } else {
              addPatient(data);
              trackPixel("PatientRegistered", data.source);
            }
            setAdding(false); setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function PatientModal({
  patient,
  onClose,
  onSave,
}: {
  patient: Patient | null;
  onClose: () => void;
  onSave: (data: Omit<Patient, "id" | "mrNumber" | "createdAt">) => void;
}) {
  const { lang } = useApp();
  const [form, setForm] = useState<Omit<Patient, "id" | "mrNumber" | "createdAt">>({
    name: patient?.name ?? "",
    dob: patient?.dob ?? "",
    gender: patient?.gender ?? "M",
    phone: patient?.phone ?? "",
    address: patient?.address ?? "",
    allergies: patient?.allergies ?? "-",
    category: patient?.category ?? "umum",
    source: patient?.source ?? "organic",
    notes: patient?.notes ?? "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{patient ? t("edit", lang) + " " + t("patients", lang) : t("addPatient", lang)}</h2>
          <button onClick={onClose} className="btn btn-ghost text-xs px-2"><X className="w-4 h-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.dob || !form.phone) return;
            onSave(form);
          }}
          className="p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">{t("fullName", lang)} *</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("dob", lang)} *</label>
              <input className="input" type="date" required value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("gender", lang)}</label>
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "M" | "F" })}>
                <option value="M">{t("male", lang)}</option>
                <option value="F">{t("female", lang)}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("phone", lang)} *</label>
              <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium block mb-1">{t("address", lang)}</label>
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("allergies", lang)}</label>
              <input className="input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("category", lang)}</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PatientCategory })}>
                <option value="umum">{t("general", lang)}</option>
                <option value="bpjs">{t("bpjs", lang)}</option>
                <option value="asuransi">{t("insurance", lang)}</option>
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
            <div>
              <label className="text-xs font-medium block mb-1">{t("notes", lang)}</label>
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
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
