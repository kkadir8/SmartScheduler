"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, Clock } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

interface Instructor { id: number; name: string; title: string; }
type AvailabilityMap = Record<number, Set<number>>;
interface Props { instructor: Instructor; onClose: () => void; }

export default function AvailabilityModal({ instructor, onClose }: Props) {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityMap>(() =>
    Object.fromEntries(DAYS.map((_, i) => [i, new Set<number>()]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await apiFetch<{ dayOfWeek: number; hour: number }[]>(
        `/api/instructors/${instructor.id}/availability`
      );
      if (!result.error) {
        const map: AvailabilityMap = Object.fromEntries(DAYS.map((_, i) => [i, new Set<number>()]));
        (result.data ?? []).forEach(({ dayOfWeek, hour }) => { map[dayOfWeek]?.add(hour); });
        setAvailability(map);
      }
      setLoading(false);
    };
    load();
  }, [instructor.id]);

  const toggle = (day: number, hour: number) => {
    setAvailability((prev) => {
      const next = { ...prev, [day]: new Set(prev[day]) };
      if (next[day].has(hour)) next[day].delete(hour);
      else next[day].add(hour);
      return next;
    });
    setSaved(false);
  };

  const toggleDay = (day: number) => {
    setAvailability((prev) => {
      const allSelected = HOURS.every((h) => prev[day].has(h));
      return { ...prev, [day]: new Set(allSelected ? [] : HOURS) };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload: { dayOfWeek: number; hour: number }[] = [];
    Object.entries(availability).forEach(([day, hours]) => {
      hours.forEach((hour) => payload.push({ dayOfWeek: Number(day), hour }));
    });
    const result = await apiFetch(`/api/instructors/${instructor.id}/availability`, {
      method: "PUT",
      token: user?.token,
      body: JSON.stringify(payload),
    });
    if (result.error) {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  const totalSlots = Object.values(availability).reduce((sum, hours) => sum + hours.size, 0);

  if (!mounted) return null;

  return createPortal(
    <div
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
    >
      <div
        className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white">Müsaitlik Ayarları</h3>
            <p className="text-xs text-white/40 mt-0.5">{instructor.title} {instructor.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {totalSlots > 0 && (
              <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-3 py-1 rounded-lg">
                <Clock size={12} className="text-accent" />
                <span className="text-xs text-accent font-medium">{totalSlots} saat seçili</span>
              </div>
            )}
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-[11px] text-white/30 font-medium text-left pb-2 pr-2 w-12">Saat</th>
                  {DAYS.map((day, i) => {
                    const allSelected = HOURS.every((h) => availability[i].has(h));
                    const someSelected = HOURS.some((h) => availability[i].has(h));
                    return (
                      <th key={day} className="pb-2 px-0.5 text-center">
                        <button
                          onClick={() => toggleDay(i)}
                          className={`text-[11px] font-semibold px-1 py-1 rounded-lg transition-all w-full ${
                            allSelected ? "bg-accent text-white"
                            : someSelected ? "bg-accent/20 text-accent border border-accent/30"
                            : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="text-[11px] text-white/30 pr-2 py-0.5 font-mono">{hour}:00</td>
                    {DAYS.map((_, dayIdx) => {
                      const selected = availability[dayIdx].has(hour);
                      return (
                        <td key={dayIdx} className="px-0.5 py-0.5 text-center">
                          <button
                            onClick={() => toggle(dayIdx, hour)}
                            className={`w-full h-7 rounded-md transition-all text-xs font-medium border ${
                              selected
                                ? "bg-accent/20 border-accent/40 text-accent hover:bg-accent/30"
                                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12]"
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent/20 border border-accent/40" />
              <span className="text-xs text-white/40">Müsait</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/[0.03] border border-white/[0.06]" />
              <span className="text-xs text-white/40">Müsait değil</span>
            </div>
            <span className="text-xs text-white/25 ml-auto">Gün başlığına tıklayarak tümünü seç/kaldır</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex-shrink-0">
          {error && (
            <div className="mb-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 font-medium py-2.5 rounded-xl transition-all text-sm">
              İptal
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : saved ? <>✓ Kaydedildi</>
                : <><Save size={14} />Kaydet</>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
