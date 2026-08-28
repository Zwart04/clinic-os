"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { fmtIDR, fmtDate, todayISO } from "@/lib/utils";
import { addMedicine, updateMedicine, getDB } from "@/lib/store";
import { Plus, X, AlertTriangle, Edit2 } from "lucide-react";

export default function PharmacyPage() {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const reload = () => setDb(getDB());
    window.addEventListener("co-db-change", reload);
    return () => window.removeEventListener("co-db-change", reload);
  }, []);

  const lowStock = db.medicines.filter((m) => m.stock <= m.minStock);
  const expSoon = db.medicines.filter((m) => {
    if (!m.expDate) return false;
    const days = (new Date(m.expDate).getTime() - Date.now()) / 86400000;
    return days < 90;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("pharmacy", lang)}</h1>
          <p className="text-sm text-muted-foreground">{db.medicines.length} {lang === "id" ? "item" : "items"}</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn btn-primary text-xs">
          <Plus className="w-3 h-3" />{t("addMedicine", lang)}
        </button>
      </div>

      {(lowStock.length > 0 || expSoon.length > 0) && (
        <div className="card p-3 bg-amber-50/50 dark:bg-amber-950/20 border-amber-300">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">{lang === "id" ? "Peringatan" : "Alerts"}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {lowStock.length > 0 && <div>{lowStock.length} {lang === "id" ? "item stok rendah" : "low-stock items"}</div>}
            {expSoon.length > 0 && <div>{expSoon.length} {lang === "id" ? "akan kadaluarsa" : "expiring soon"}</div>}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">{t("medicineName", lang)}</th>
                <th className="text-left p-3 hidden md:table-cell">SKU</th>
                <th className="text-right p-3">{t("stock", lang)}</th>
                <th className="text-right p-3 hidden md:table-cell">{t("cost", lang)}</th>
                <th className="text-right p-3">{t("price", lang)}</th>
                <th className="text-left p-3 hidden lg:table-cell">{t("expDate", lang)}</th>
                <th className="text-right p-3">{t("actions", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {db.medicines.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground text-xs">{t("noMedicine", lang)}</td>
                </tr>
              )}
              {db.medicines.map((m) => {
                const isLow = m.stock <= m.minStock;
                return (
                  <tr key={m.id} className={`border-t ${isLow ? "bg-red-50/30 dark:bg-red-950/20" : ""}`}>
                    <td className="p-3">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground md:hidden">SKU: {m.sku} · {m.batch}</div>
                    </td>
                    <td className="p-3 text-xs font-mono hidden md:table-cell">{m.sku}</td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${isLow ? "text-red-600" : ""}`}>{m.stock}</span>
                      <span className="text-[10px] text-muted-foreground"> / {m.minStock}</span>
                      <div className="text-[10px] text-muted-foreground">{m.unit}</div>
                    </td>
                    <td className="p-3 text-right text-xs hidden md:table-cell">{fmtIDR(m.cost)}</td>
                    <td className="p-3 text-right text-xs font-medium">{fmtIDR(m.price)}</td>
                    <td className="p-3 text-xs hidden lg:table-cell">{m.expDate}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditingId(m.id)} className="btn btn-ghost text-xs px-2">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editingId) && (
        <MedicineModal
          medicineId={editingId}
          onClose={() => { setAdding(false); setEditingId(null); }}
        />
      )}
    </div>
  );
}

function MedicineModal({ medicineId, onClose }: { medicineId: string | null; onClose: () => void }) {
  const { lang } = useApp();
  const [db, setDb] = useState(() => getDB());
  const existing = medicineId ? db.medicines.find((m) => m.id === medicineId) : null;
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    sku: existing?.sku ?? "",
    unit: existing?.unit ?? "tablet",
    stock: existing?.stock ?? 0,
    minStock: existing?.minStock ?? 10,
    price: existing?.price ?? 0,
    cost: existing?.cost ?? 0,
    batch: existing?.batch ?? "",
    expDate: existing?.expDate ?? "",
    supplier: existing?.supplier ?? "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{existing ? t("edit", lang) : t("addMedicine", lang)}</h2>
          <button onClick={onClose} className="btn btn-ghost text-xs px-2"><X className="w-4 h-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (existing) {
              updateMedicine(existing.id, form);
            } else {
              addMedicine(form);
            }
            onClose();
          }}
          className="p-4 space-y-3"
        >
          <div>
            <label className="text-xs font-medium block mb-1">{t("medicineName", lang)}</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">SKU</label>
              <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{lang === "id" ? "Satuan" : "Unit"}</label>
              <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="tablet">tablet</option>
                <option value="strip">strip</option>
                <option value="botol">botol</option>
                <option value="box">box</option>
                <option value="sachet">sachet</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("stock", lang)}</label>
              <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("minStock", lang)}</label>
              <input className="input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("cost", lang)} (IDR)</label>
              <input className="input" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("price", lang)} (IDR)</label>
              <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("batch", lang)}</label>
              <input className="input" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">{t("expDate", lang)}</label>
              <input className="input" type="date" value={form.expDate} onChange={(e) => setForm({ ...form, expDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">{lang === "id" ? "Supplier" : "Supplier"}</label>
            <input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
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
