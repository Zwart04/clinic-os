// WAHA integration - send WhatsApp messages via WAHA HTTP API
// Spec: devlikeapro/waha - POST {baseUrl}/api/sendText
// Headers: X-Api-Key (or no auth in dev) + Content-Type: application/json
// Body: { chatId: "<phone>@c.us", text: "..." }

export interface SendTextResult {
  ok: boolean;
  status: number;
  detail?: string;
}

export async function sendText(
  baseUrl: string,
  phone: string,
  text: string,
  apiKey?: string
): Promise<SendTextResult> {
  if (!baseUrl) return { ok: false, status: 0, detail: "WAHA URL not set" };
  const cleanedPhone = phone.replace(/\D/g, "");
  const chatId = `${cleanedPhone}@c.us`;
  const url = `${baseUrl.replace(/\/$/, "")}/api/sendText`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-Api-Key": apiKey } : {}),
      },
      body: JSON.stringify({ chatId, text }),
    });
    const text2 = await res.text();
    let detail: string | undefined = text2.slice(0, 200);
    try { detail = JSON.parse(text2).detail ?? detail; } catch { /* keep raw */ }
    return { ok: res.ok, status: res.status, detail };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "network error";
    return { ok: false, status: 0, detail: msg };
  }
}

export function reminderTemplate(
  patientName: string,
  doctor: string,
  dateISO: string
): string {
  const dt = new Date(dateISO);
  const dateStr = dt.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `Halo ${patientName}, ini pengingat janji temu Anda di klinik pada ${dateStr} pukul ${timeStr} WIB dengan ${doctor}. Mohon datang 10 menit lebih awal. Terima kasih.`;
}

export function prescriptionPickupTemplate(patientName: string, items: string[]): string {
  return `Halo ${patientName}, resep Anda sudah siap diambil: ${items.join(", ")}. Silakan datang ke apotek klinik pada jam operasional. Terima kasih.`;
}
