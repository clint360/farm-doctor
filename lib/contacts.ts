// ─── Centralised contact details (loaded from env) ───
// All NEXT_PUBLIC_ vars are inlined at build time by Next.js.
// Defaults match the current production values.

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+237 6 82 64 25 53";
export const WHATSAPP_DISPLAY = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || "+237 6 82 64 25 53";
export const CALL_NUMBER = process.env.NEXT_PUBLIC_CALL_NUMBER || "+237 6 82 64 25 53";
export const CALL_DISPLAY = process.env.NEXT_PUBLIC_CALL_DISPLAY || "/call";
export const COMPANY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || "+237 6 80 61 23 60";
export const COMPANY_DISPLAY = process.env.NEXT_PUBLIC_COMPANY_DISPLAY || "+237 6 80 61 23 60";
export const TELEGRAM_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT || "Farm_doctor_bot";
export const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/share/1AR6vKAdz6/?mibextid=wwXIfr";

export const PHONE_PLACEHOLDER = process.env.NEXT_PUBLIC_PHONE_PLACEHOLDER || "680612360";

export const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const TG_LINK = `https://t.me/${TELEGRAM_BOT}`;
