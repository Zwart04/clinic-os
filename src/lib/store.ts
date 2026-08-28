import { uid, todayISO } from "./utils";

export type Gender = "M" | "F";
export type PatientCategory = "umum" | "bpjs" | "asuransi";
export type VisitStatus = "waiting" | "inroom" | "done" | "cancelled";
export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "done";

export interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  dob: string;
  gender: Gender;
  phone: string;
  address: string;
  allergies: string;
  category: PatientCategory;
  source: string; // attribution: meta / google / tiktok / organic / direct
  notes: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  doctor: string;
  complaint: string;
  diagnosis: string;
  icd10: string;
  treatment: string;
  prescription: { medicineId: string; qty: number; dose: string }[];
  vitals: { bp: string; pulse: string; temp: string };
  fee: number;
  status: VisitStatus;
  queueNumber: number;
  notes: string;
  createdAt: string;
}

export interface QueueItem {
  id: string;
  patientId: string;
  visitId?: string;
  number: number;
  status: VisitStatus;
  registeredAt: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  source: string;
  estimatedMinutes: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctor: string;
  date: string; // ISO
  duration: number; // minutes
  status: AppointmentStatus;
  reason: string;
  source: string;
  reminderSent: boolean;
  notes: string;
  createdAt: string;
}

export type AnyStatus = VisitStatus | AppointmentStatus;

export interface Medicine {
  id: string;
  name: string;
  sku: string;
  unit: string; // box, strip, tablet
  stock: number;
  minStock: number;
  price: number; // selling price per unit
  cost: number; // cost per unit
  batch: string;
  expDate: string;
  supplier: string;
  createdAt: string;
}

export interface Dispense {
  id: string;
  visitId: string;
  patientId: string;
  items: { medicineId: string; qty: number; priceAtDispense: number }[];
  total: number;
  date: string;
  notes: string;
}

export type JournalKind = "income" | "expense";
export type JournalSource = "auto-visit" | "auto-dispense" | "auto-stock" | "manual" | "auto-reminder";

export interface JournalEntry {
  id: string;
  kind: JournalKind;
  source: JournalSource;
  amount: number;
  date: string;
  description: string;
  refId?: string;
  refType?: string;
  createdAt: string;
}

export interface PixelEvent {
  id: string;
  name: string;
  date: string;
  source: string;
  value?: number;
  meta?: Record<string, string | number>;
}

interface DB {
  patients: Patient[];
  visits: Visit[];
  queue: QueueItem[];
  appointments: Appointment[];
  medicines: Medicine[];
  dispenses: Dispense[];
  journal: JournalEntry[];
  pixels: PixelEvent[];
  wahaUrl: string;
  wahaStatus: "connected" | "disconnected" | "unknown";
  initialized: boolean;
}

const KEY = "co_db_v1";

const SEED: DB = {
  patients: [
    {
      id: "p1", mrNumber: "RM-0001", name: "Budi Santoso", dob: "1985-03-12", gender: "M",
      phone: "081234567890", address: "Jl. Merdeka No. 12, Jakarta", allergies: "Penisilin",
      category: "bpjs", source: "meta", notes: "Diabetes tipe 2",
      createdAt: "2026-08-15T08:00:00+07:00",
    },
    {
      id: "p2", mrNumber: "RM-0002", name: "Siti Rahayu", dob: "1992-08-25", gender: "F",
      phone: "081234567891", address: "Jl. Sudirman No. 5, Jakarta", allergies: "-",
      category: "umum", source: "google", notes: "",
      createdAt: "2026-08-20T09:00:00+07:00",
    },
    {
      id: "p3", mrNumber: "RM-0003", name: "Andi Wijaya", dob: "1978-11-03", gender: "M",
      phone: "081234567892", address: "Jl. Thamrin No. 8, Jakarta", allergies: "Seafood",
      category: "asuransi", source: "tiktok", notes: "Hipertensi",
      createdAt: "2026-08-25T10:30:00+07:00",
    },
  ],
  visits: [
    {
      id: "v1", patientId: "p1", date: "2026-08-28T08:30:00+07:00", doctor: "Dr. Ahmad",
      complaint: "Pusing, lemas", diagnosis: "Hipoglikemia", icd10: "E16.2",
      treatment: "Infus dextrose", prescription: [], vitals: { bp: "120/80", pulse: "88", temp: "36.5" },
      fee: 150000, status: "done", queueNumber: 1, notes: "", createdAt: "2026-08-28T08:30:00+07:00",
    },
  ],
  queue: [],
  appointments: [
    {
      id: "a1", patientId: "p2", patientName: "Siti Rahayu", patientPhone: "081234567891",
      doctor: "Dr. Ahmad", date: "2026-08-30T10:00:00+07:00", duration: 30,
      status: "scheduled", reason: "Kontrol bulanan", source: "organic",
      reminderSent: false, notes: "", createdAt: "2026-08-27T14:00:00+07:00",
    },
  ],
  medicines: [
    { id: "m1", name: "Paracetamol 500mg", sku: "PCT500", unit: "tablet", stock: 200, minStock: 50, price: 1500, cost: 800, batch: "B2026-A", expDate: "2027-12-31", supplier: "PT Kimia Farma", createdAt: "2026-08-01T08:00:00+07:00" },
    { id: "m2", name: "Amoxicillin 500mg", sku: "AMX500", unit: "tablet", stock: 30, minStock: 40, price: 3500, cost: 2000, batch: "B2026-B", expDate: "2027-08-31", supplier: "PT Indofarma", createdAt: "2026-08-01T08:00:00+07:00" },
    { id: "m3", name: "OBH Combi", sku: "OBH", unit: "botol", stock: 45, minStock: 20, price: 25000, cost: 15000, batch: "B2026-C", expDate: "2028-01-31", supplier: "PT Combiphar", createdAt: "2026-08-01T08:00:00+07:00" },
    { id: "m4", name: "Metformin 500mg", sku: "MET500", unit: "tablet", stock: 12, minStock: 30, price: 2000, cost: 1000, batch: "B2026-D", expDate: "2027-06-30", supplier: "PT Kimia Farma", createdAt: "2026-08-01T08:00:00+07:00" },
  ],
  dispenses: [],
  journal: [
    { id: "j1", kind: "income", source: "auto-visit", amount: 150000, date: "2026-08-28T08:45:00+07:00", description: "Visit Budi Santoso", refId: "v1", refType: "visit", createdAt: "2026-08-28T08:45:00+07:00" },
  ],
  pixels: [],
  wahaUrl: "",
  wahaStatus: "unknown",
  initialized: true,
};

export function getDB(): DB {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw);
  } catch {
    return SEED;
  }
}

export function setDB(db: DB) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
  // Notify same-tab listeners
  window.dispatchEvent(new CustomEvent("co-db-change"));
}

export function resetDB(): DB {
  if (typeof window === "undefined") return SEED;
  window.localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

// ----- Patient helpers -----
export function addPatient(p: Omit<Patient, "id" | "mrNumber" | "createdAt">): Patient {
  const db = getDB();
  const id = uid("p");
  const num = String(db.patients.length + 1).padStart(4, "0");
  const patient: Patient = { ...p, id, mrNumber: `RM-${num}`, createdAt: todayISO() };
  db.patients.push(patient);
  setDB(db);
  return patient;
}

export function updatePatient(id: string, patch: Partial<Patient>) {
  const db = getDB();
  const i = db.patients.findIndex((p) => p.id === id);
  if (i >= 0) {
    db.patients[i] = { ...db.patients[i], ...patch };
    setDB(db);
  }
}

export function deletePatient(id: string) {
  const db = getDB();
  db.patients = db.patients.filter((p) => p.id !== id);
  setDB(db);
}

// ----- Visit + auto-journal -----
export function addVisit(v: Omit<Visit, "id" | "createdAt" | "queueNumber" | "status"> & { status?: VisitStatus }): Visit {
  const db = getDB();
  const id = uid("v");
  const queueNumber = (db.visits.filter((x) => x.date.slice(0, 10) === v.date.slice(0, 10)).length) + 1;
  const visit: Visit = { ...v, id, createdAt: todayISO(), queueNumber, status: v.status ?? "waiting" };
  db.visits.push(visit);

  // auto-journal income (only if status=done and fee > 0)
  if (visit.status === "done" && visit.fee > 0) {
    db.journal.push({
      id: uid("j"),
      kind: "income",
      source: "auto-visit",
      amount: visit.fee,
      date: todayISO(),
      description: `Visit ${db.patients.find((p) => p.id === visit.patientId)?.name ?? "patient"}`,
      refId: visit.id,
      refType: "visit",
      createdAt: todayISO(),
    });
  }
  setDB(db);
  return visit;
}

export function updateVisit(id: string, patch: Partial<Visit>) {
  const db = getDB();
  const i = db.visits.findIndex((v) => v.id === id);
  if (i < 0) return;
  const before = db.visits[i];
  db.visits[i] = { ...before, ...patch };
  // If status changed from non-done to done, add auto-journal
  if (before.status !== "done" && db.visits[i].status === "done" && db.visits[i].fee > 0) {
    const exists = db.journal.find((j) => j.refId === db.visits[i].id && j.refType === "visit");
    if (!exists) {
      db.journal.push({
        id: uid("j"),
        kind: "income",
        source: "auto-visit",
        amount: db.visits[i].fee,
        date: todayISO(),
        description: `Visit ${db.patients.find((p) => p.id === db.visits[i].patientId)?.name ?? "patient"}`,
        refId: db.visits[i].id,
        refType: "visit",
        createdAt: todayISO(),
      });
    }
  }
  setDB(db);
}

// ----- Queue -----
export function enqueue(patientId: string, source = "organic"): QueueItem {
  const db = getDB();
  const today = new Date().toISOString().slice(0, 10);
  const todayQueue = db.queue.filter((q) => q.registeredAt.slice(0, 10) === today);
  const number = todayQueue.length + 1;
  const item: QueueItem = {
    id: uid("q"),
    patientId,
    number,
    status: "waiting",
    registeredAt: todayISO(),
    source,
    estimatedMinutes: 15,
  };
  db.queue.push(item);
  setDB(db);
  return item;
}

export function advanceQueue(id: string) {
  const db = getDB();
  const item = db.queue.find((q) => q.id === id);
  if (!item) return;
  if (item.status === "waiting") {
    item.status = "inroom";
    item.calledAt = todayISO();
  } else if (item.status === "inroom") {
    item.status = "done";
    item.completedAt = todayISO();
  }
  setDB(db);
}

export function cancelQueue(id: string) {
  const db = getDB();
  const item = db.queue.find((q) => q.id === id);
  if (item) {
    item.status = "cancelled";
    setDB(db);
  }
}

// ----- Appointment -----
export function addAppointment(a: Omit<Appointment, "id" | "createdAt" | "reminderSent" | "status"> & { status?: AppointmentStatus }): Appointment {
  const db = getDB();
  const appt: Appointment = { ...a, id: uid("a"), createdAt: todayISO(), reminderSent: false, status: a.status ?? "scheduled" };
  db.appointments.push(appt);
  setDB(db);
  return appt;
}

export function updateAppointment(id: string, patch: Partial<Appointment>) {
  const db = getDB();
  const i = db.appointments.findIndex((a) => a.id === id);
  if (i >= 0) {
    db.appointments[i] = { ...db.appointments[i], ...patch };
    setDB(db);
  }
}

export function markReminderSent(id: string) {
  const db = getDB();
  const i = db.appointments.findIndex((a) => a.id === id);
  if (i >= 0) {
    db.appointments[i].reminderSent = true;
    db.pixels.push({
      id: uid("px"),
      name: "AppointmentReminder",
      date: todayISO(),
      source: db.appointments[i].source,
    });
    setDB(db);
  }
}

// ----- Pharmacy -----
export function addMedicine(m: Omit<Medicine, "id" | "createdAt">): Medicine {
  const db = getDB();
  const med: Medicine = { ...m, id: uid("m"), createdAt: todayISO() };
  db.medicines.push(med);
  // auto-journal expense for stock cost
  if (m.cost > 0 && m.stock > 0) {
    db.journal.push({
      id: uid("j"),
      kind: "expense",
      source: "auto-stock",
      amount: m.cost * m.stock,
      date: todayISO(),
      description: `Stock in: ${m.name} (${m.stock} ${m.unit})`,
      refId: med.id,
      refType: "medicine",
      createdAt: todayISO(),
    });
  }
  setDB(db);
  return med;
}

export function updateMedicine(id: string, patch: Partial<Medicine>) {
  const db = getDB();
  const i = db.medicines.findIndex((m) => m.id === id);
  if (i >= 0) {
    db.medicines[i] = { ...db.medicines[i], ...patch };
    setDB(db);
  }
}

export function dispense(visitId: string, patientId: string, items: { medicineId: string; qty: number }[]): Dispense {
  const db = getDB();
  let total = 0;
  const dispensedItems = items.map((it) => {
    const med = db.medicines.find((m) => m.id === it.medicineId);
    if (!med) throw new Error("Medicine not found");
    med.stock = Math.max(0, med.stock - it.qty);
    total += med.price * it.qty;
    return { medicineId: it.medicineId, qty: it.qty, priceAtDispense: med.price };
  });
  const d: Dispense = {
    id: uid("d"),
    visitId,
    patientId,
    items: dispensedItems,
    total,
    date: todayISO(),
    notes: "",
  };
  db.dispenses.push(d);
  db.journal.push({
    id: uid("j"),
    kind: "income",
    source: "auto-dispense",
    amount: total,
    date: todayISO(),
    description: `Dispense ${items.length} item(s)`,
    refId: d.id,
    refType: "dispense",
    createdAt: todayISO(),
  });
  db.pixels.push({
    id: uid("px"),
    name: "DispenseFilled",
    date: todayISO(),
    source: "in-app",
    value: total,
  });
  setDB(db);
  return d;
}

// ----- Journal -----
export function addManualJournal(kind: JournalKind, amount: number, description: string) {
  const db = getDB();
  db.journal.push({
    id: uid("j"),
    kind,
    source: "manual",
    amount,
    date: todayISO(),
    description,
    createdAt: todayISO(),
  });
  setDB(db);
}

// ----- Pixel -----
export function trackPixel(name: string, source: string, value?: number, meta?: Record<string, string | number>) {
  const db = getDB();
  db.pixels.push({
    id: uid("px"),
    name,
    date: todayISO(),
    source,
    value,
    meta,
  });
  setDB(db);
}

// ----- WAHA config -----
export function setWahaConfig(url: string, status: "connected" | "disconnected" | "unknown") {
  const db = getDB();
  db.wahaUrl = url;
  db.wahaStatus = status;
  setDB(db);
}
