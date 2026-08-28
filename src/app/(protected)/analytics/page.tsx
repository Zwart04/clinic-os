"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtIDR } from "@/lib/utils";
import { getDB } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const SOURCE_COLORS: Record<string, string> = {
  meta: "#0ea5e9",
  google: "#10b981",
  tiktok: "#a855f7",
  organic: "#6b7280",
  direct: "#f59e0b",
  "in-app": "#ef4444",
};

export default function AnalyticsPage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  // Source attribution from patients
  const patientBySource: Record<string, number> = {};
  db.patients.forEach((p) => {
    patientBySource[p.source] = (patientBySource[p.source] ?? 0) + 1;
  });
  const patientSourceData = Object.entries(patientBySource).map(([name, value]) => ({ name, value }));

  // Pixel events
  const eventsByName: Record<string, number> = {};
  db.pixels.forEach((px) => {
    eventsByName[px.name] = (eventsByName[px.name] ?? 0) + 1;
  });
  const eventData = Object.entries(eventsByName).map(([name, count]) => ({ name, count }));

  // 14-day registrations
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const regTrend = days.map((d) => ({
    date: new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    patients: db.patients.filter((p) => p.createdAt.slice(0, 10) === d).length,
    visits: db.visits.filter((v) => v.date.slice(0, 10) === d).length,
  }));

  // Visits by doctor
  const byDoctor: Record<string, { count: number; income: number }> = {};
  db.visits.forEach((v) => {
    if (!byDoctor[v.doctor]) byDoctor[v.doctor] = { count: 0, income: 0 };
    byDoctor[v.doctor].count++;
    byDoctor[v.doctor].income += v.fee;
  });
  const doctorData = Object.entries(byDoctor).map(([name, d]) => ({ name, ...d }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("analytics", lang)}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "id" ? "Performa klinik, atribusi sumber, dan pixel events." : "Clinic performance, source attribution, and pixel events."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3">{lang === "id" ? "Pasien per Sumber" : "Patients per Source"}</h3>
          {patientSourceData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
              {lang === "id" ? "Belum ada data" : "No data"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={patientSourceData} dataKey="value" nameKey="name" outerRadius={80} label={(p) => `${p.name}: ${p.value}`} fontSize={10}>
                  {patientSourceData.map((entry) => (
                    <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3">{lang === "id" ? "Pixel Events" : "Pixel Events"}</h3>
          {eventData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
              {lang === "id" ? "Belum ada event" : "No events yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-4 md:col-span-2">
          <h3 className="font-semibold text-sm mb-3">{lang === "id" ? "Tren 14 Hari" : "14-Day Trend"}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={regTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="patients" stroke="#0ea5e9" name={lang === "id" ? "Pasien" : "Patients"} strokeWidth={2} />
              <Line type="monotone" dataKey="visits" stroke="#10b981" name={lang === "id" ? "Kunjungan" : "Visits"} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 md:col-span-2">
          <h3 className="font-semibold text-sm mb-3">{lang === "id" ? "Performa Dokter" : "Doctor Performance"}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={doctorData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis yAxisId="left" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number, n: string) => n === "income" ? fmtIDR(v) : v} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="count" fill="#0ea5e9" name={lang === "id" ? "Kunjungan" : "Visits"} />
              <Bar yAxisId="right" dataKey="income" fill="#10b981" name={t("income", lang)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-sm mb-2">{lang === "id" ? "Daftar Pixel Events" : "Pixel Events List"}</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {db.pixels.length === 0 ? (
            <div className="text-xs text-muted-foreground py-4 text-center">
              {lang === "id" ? "Belum ada event tercatat." : "No events recorded yet."}
            </div>
          ) : (
            [...db.pixels].reverse().slice(0, 30).map((px) => (
              <div key={px.id} className="flex items-center justify-between text-xs p-2 border-b">
                <div>
                  <span className="font-medium">{px.name}</span>
                  <span className="ml-2 text-muted-foreground">{px.date.slice(0, 16).replace("T", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-gray">{px.source}</span>
                  {px.value != null && <span className="text-emerald-600 font-medium">{fmtIDR(px.value)}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
