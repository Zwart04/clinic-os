"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope, Pill, Wallet, TrendingUp, AlertTriangle, Activity, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtIDR, fmtDate, todayISO } from "@/lib/utils";
import { getDB } from "@/lib/store";

const SOURCE_COLORS: Record<string, string> = {
  meta: "#0ea5e9",
  google: "#10b981",
  tiktok: "#a855f7",
  organic: "#6b7280",
  direct: "#f59e0b",
  "in-app": "#ef4444",
};

export default function DashboardPage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  const today = todayISO().slice(0, 10);
  const todayVisits = db.visits.filter((v) => v.date.slice(0, 10) === today);
  const todayQueue = db.queue.filter((q) => q.registeredAt.slice(0, 10) === today && q.status !== "cancelled");
  const lowStockMeds = db.medicines.filter((m) => m.stock <= m.minStock);
  const upcomingAppts = db.appointments.filter((a) => a.status === "scheduled" && new Date(a.date).getTime() > Date.now()).length;
  const totalPatients = db.patients.length;

  // 7-day income trend
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const trendData = days.map((d) => {
    const dayIncome = db.journal.filter((j) => j.kind === "income" && j.date.slice(0, 10) === d).reduce((s, j) => s + j.amount, 0);
    const dayExpense = db.journal.filter((j) => j.kind === "expense" && j.date.slice(0, 10) === d).reduce((s, j) => s + j.amount, 0);
    return {
      date: new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      income: dayIncome,
      expense: dayExpense,
    };
  });

  // Source attribution
  const sourceData: Record<string, number> = {};
  db.patients.forEach((p) => {
    sourceData[p.source] = (sourceData[p.source] ?? 0) + 1;
  });
  const sourcePie = Object.entries(sourceData).map(([name, value]) => ({ name, value }));

  const monthIncome = db.journal.filter((j) => j.kind === "income" && j.date.slice(0, 10).slice(0, 7) === today.slice(0, 7)).reduce((s, j) => s + j.amount, 0);
  const monthExpense = db.journal.filter((j) => j.kind === "expense" && j.date.slice(0, 10).slice(0, 7) === today.slice(0, 7)).reduce((s, j) => s + j.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard", lang)}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "id" ? "Ringkasan operasional klinik Anda hari ini." : "Your clinic operational overview today."}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={<Users className="w-4 h-4" />} label={lang === "id" ? "Total Pasien" : "Total Patients"} value={String(totalPatients)} color="bg-sky-500" />
        <KpiCard icon={<Activity className="w-4 h-4" />} label={lang === "id" ? "Antrian Hari Ini" : "Today's Queue"} value={String(todayQueue.length)} color="bg-emerald-500" />
        <KpiCard icon={<Stethoscope className="w-4 h-4" />} label={lang === "id" ? "Kunjungan Hari Ini" : "Today's Visits"} value={String(todayVisits.length)} color="bg-violet-500" />
        <KpiCard icon={<Calendar className="w-4 h-4" />} label={lang === "id" ? "Janji Mendatang" : "Upcoming Appts"} value={String(upcomingAppts)} color="bg-amber-500" />
      </div>

      {/* Finance summary */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{t("income", lang)}</span>
          </div>
          <div className="text-xl font-bold">{fmtIDR(monthIncome)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{lang === "id" ? "Bulan ini" : "This month"}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{t("expense", lang)}</span>
          </div>
          <div className="text-xl font-bold">{fmtIDR(monthExpense)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{lang === "id" ? "Bulan ini" : "This month"}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Pill className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{lang === "id" ? "Stok Rendah" : "Low Stock"}</span>
          </div>
          <div className="text-xl font-bold">{lowStockMeds.length} <span className="text-sm font-normal text-muted-foreground">{lang === "id" ? "item" : "items"}</span></div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{lang === "id" ? "Perlu restock" : "Need restock"}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 md:col-span-2">
          <h3 className="font-semibold mb-3 text-sm">{lang === "id" ? "Pendapatan & Pengeluaran 7 Hari" : "Income & Expense (7 days)"}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: number) => fmtIDR(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="income" stroke="#10b981" name={t("income", lang)} strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name={t("expense", lang)} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3 text-sm">{lang === "id" ? "Sumber Pasien" : "Patient Source"}</h3>
          {sourcePie.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
              {lang === "id" ? "Belum ada data" : "No data"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sourcePie} dataKey="value" nameKey="name" outerRadius={80} label={(p) => `${p.name}: ${p.value}`} fontSize={10}>
                  {sourcePie.map((entry) => (
                    <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStockMeds.length > 0 && (
        <div className="card p-4 border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-semibold text-sm">{lang === "id" ? "Peringatan Stok Rendah" : "Low Stock Alerts"}</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {lowStockMeds.map((m) => (
              <div key={m.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded-md text-sm">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground">SKU: {m.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">{m.stock}</div>
                  <div className="text-[10px] text-muted-foreground">/ {m.minStock} min</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-md ${color} text-white flex items-center justify-center`}>{icon}</div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
