export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"] as const;
export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;
// 2 saatlik ders en geç 16:00'da başlayabilir (16:00–18:00). 17:00 sabitlenirse blok taşar.
export const LOCK_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16] as const;
