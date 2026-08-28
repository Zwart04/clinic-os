"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtIDR, fmtDateTime } from "@/lib/utils";
import { addManualJournal, getDB, JournalKind } from "@/lib/store";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function FinancePage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  const sorted = useMemo(() => [...db.journal].sort((a, b) => b.date.localeCompare(a.date)), [db.journal]);

  const totalIncome = db.journal.filter((j) => j.kind === "income").reduce((s, j) => s + j.amount, 0);
  const totalExpense = db.journal.filter((j) => j.kind === "expense").reduce((s, j) => s + j.amount, 0);

  // 30-day chart
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const monthly = days.map((d) => {
    const inc = db.journal.filter((j) => j.kind === "income" && j.date.slice(0, 10) === d).reduce((s, j) => s + j.amount, 0);
    const exp = db.journal.filter((j) => j.kind === "expense" && j.date.slice(0, 10) === d).reduce((s, j) => s + j.amount, 0);
    return {
      date: new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      income: inc,
      expense: exp,
      profit: inc - exp,
    };
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ClinicOS - Journal Report", 14, 16);
    doc.setFontSize(9);
    doc.text(`Income: ${fmtIDR(totalIncome)} | Expense: ${fmtIDR(totalExpense)} | Net: ${fmtIDR(totalIncome - totalExpense)}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [["Date", "Kind", "Source", "Description", "Amount"]],
      body: sorted.slice(0, 100).map((j) => [j.date.slice(0, 10), j.kind, j.source, j.description, fmtIDR(j.amount)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 165, 233] },
    });
    doc.save(`clinic-os-journal.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("finance", lang)}</h1>
          <p className="text-sm text-muted-foreground">
            {lang === "id" ? "Jurnal otomatis + entri manual" : "Auto journal + manual entries"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn btn-outline text-xs">PDF</button>
          <button onClick={() => setAdding(true)} className="btn btn-primary text-xs">
            <Plus className="w-3 h-3" />{lang === "id" ? "Entri Manual" : "Manual Entry"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1 text-xs font-medium uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" /> {t("income", lang)}
          </div>
          <div className="text-xl font-bold">{fmtIDR(totalIncome)}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1 text-xs font-medium uppercase tracking-wider">
            <TrendingDown className="w-3 h-3" /> {t("expense", lang)}
          </div>
          <div className="text-xl font-bold">{fmtIDR(totalExpense)}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-primary mb-1 text-xs font-medium uppercase tracking-wider">
            {t("profit", lang)}
          </div>
          <div className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {fmtIDR(totalIncome - totalExpense)}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-sm mb-3">{lang === "id" ? "Tren 30 Hari" : "30-Day Trend"}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={10} interval={4} />
            <YAxis fontSize={10} />
            <Tooltip formatter={(v: number) => fmtIDR(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="income" fill="#10b981" name={t("income", lang)} />
            <Bar dataKey="expense" fill="#ef4444" name={t("expense", lang)} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">{t("date", lang)}</th>
                <th className="text-left p-3">{lang === "id" ? "Tipe" : "Kind"}</th>
                <th className="text-left p-3">{t("source", lang)}</th>
                <th className="text-left p-3">{t("notes", lang)}</th>
                <th className="text-right p-3">{lang === "id" ? "Jumlah" : "Amount"}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground text-xs">{t("noTransactions", lang)}</td>
                </tr>
              )}
              {sorted.slice(0, 50).map((j) => (
                <tr key={j.id} className="border-t">
                  <td className="p-3 text-xs whitespace-nowrap">{fmtDateTime(j.date)}</td>
                  <td className="p-3">
                    <span className={`badge ${j.kind === "income" ? "badge-green" : "badge-red"}`}>{j.kind}</span>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="badge badge-gray">{j.source}</span>
                  </td>
                  <td className="p-3 text-xs">{j.description}</td>
                  <td className={`p-3 text-right font-medium ${j.kind === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {j.kind === "income" ? "+" : "-"}{fmtIDR(j.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adding && <ManualJournalModal onClose={() => setAdding(false)} />}
    </div>
  );
}

function ManualJournalModal({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const [form, setForm] = useState({ kind: "expense" as JournalKind, amount: 0, description: "" });
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{lang === "id" ? "Entri Manual" : "Manual Entry"}</h2>
          <button onClick={onClose} className="btn btn-ghost text-xs px-2"><X className="w-4 h-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.amount <= 0) return;
            addManualJournal(form.kind, form.amount, form.description);
            onClose();
          }}
          className="p-4 space-y-3"
        >
          <div>
            <label className="text-xs font-medium block mb-1">{lang === "id" ? "Tipe" : "Kind"}</label>
            <select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as JournalKind })}>
              <option value="income">{t("income", lang)}</option>
              <option value="expense">{t("expense", lang)}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{lang === "id" ? "Jumlah" : "Amount"} (IDR)</label>
            <input className="input" type="number" required min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{t("notes", lang)}</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
