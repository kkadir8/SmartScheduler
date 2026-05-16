"use client";

import { useEffect, useState } from "react";
import { X, Save, Clock } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

interface Instructor {
  id: number;
  name: string;
  title: string;
}

// availability[dayIndex] = Set of hours
type AvailabilityMap = Record<number, Set<number>>;

interface Props {
  instructor: Instructor;
  onClose: () => void;
}

export default function AvailabilityModal({ instructor, onClose }: Props) {
  const [availability, setAvailability] = useState<AvailabilityMap>(() =>
    Object.fromEntries(DAYS.map((_, i) => [i, new Set<number>()]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing availability
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/instructors/${instructor.id}/availability`
        );
        if (res.ok) {
          const data: { dayOfWeek: number; hour: number }[] = await res.json();
          const map: AvailabilityMap = Object.fromEntries(
            DAYS.map((_, i) => [i, new Set<number>()])
          );
          data.forEach(({ dayOfWeek, hour }) => {
            map[dayOfWeek]?.add(hour);
          });
          setAvailability(map);
        }
      } catch {
        // API henüz yoksa boş başlat, sorun değil
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [instructor.id]);

  const toggle = (day: number, hour: number) => {
    setAvailability((prev) => {
      const next = { ...prev, [day]: new Set(prev[day]) };
      if (next[day].has(hour)) {
        next[day].delete(hour);
      } else {
        next[day].add(hour);
      }
      return next;
    });
    setSaved(false);
  };

  const toggleDay = (day: number) => {
    setAvailability((prev) => {
      const allSelected = HOURS.every((h) => prev[day].has(h));
      const next = { ...prev, [day]: new Set(allSelected ? [] : HOURS) };
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: { dayOfWeek: number; hour: number }[] = [];
      Object.entries(availability).forEach(([day, hours]) => {
        hours.forEach((hour) => {
          payload.push({ dayOfWeek: Number(day), hour });
        });
      });

      await fetch(`${API_BASE}/api/instructors/${instructor.id}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaved(true);
    } catch {
      // Hata yönetimi
    } finally {
      setSaving(false);
    }
  };

  const totalSlots = Object.values(availability).reduce(
    (sum, hours) => sum + hours.size,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Müsaitlik Ayarları
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              {instructor.title} {instructor.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalSlots > 0 && (
              <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-3 py-1 rounded-lg">
                <Clock size={12} className="text-accent" />
                <span className="text-xs text-accent font-medium">
                  {totalSlots} saat seçili
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-6 overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-xs text-white/30 font-medium text-left pb-3 pr-3 w-16">
                      Saat
                    </th>
                    {DAYS.map((day, i) => {
                      const allSelected = HOURS.every((h) =>
                        availability[i].has(h)
                      );
                      const someSelected = HOURS.some((h) =>
                        availability[i].has(h)
                      );
                      return (
                        <th key={day} className="pb-3 px-1 text-center">
                          <button
                            onClick={() => toggleDay(i)}
                            className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-all w-full ${
                              allSelected
                                ? "bg-accent text-white"
                                : someSelected
                                ? "bg-accent/20 text-accent border border-accent/30"
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
                    <tr key={hour} className="group">
                      <td className="text-xs text-white/30 pr-3 py-1 font-mono">
                        {hour}:00
                      </td>
                      {DAYS.map((_, dayIdx) => {
                        const selected = availability[dayIdx].has(hour);
                        return (
                          <td key={dayIdx} className="px-1 py-1 text-center">
                            <button
                              onClick={() => toggle(dayIdx, hour)}
                              className={`w-full h-9 rounded-lg transition-all text-xs font-medium border ${
                                selected
                                  ? "bg-accent/20 border-accent/40 text-accent hover:bg-accent/30"
                                  : "bg-white/[0.03] border-white/[0.06] text-white/20 hover:bg-white/[0.07] hover:border-white/[0.12] hover:text-white/50"
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
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-accent/20 border border-accent/40" />
              <span className="text-xs text-white/40">Müsait</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/[0.03] border border-white/[0.06]" />
              <span className="text-xs text-white/40">Müsait değil</span>
            </div>
            <span className="text-xs text-white/25 ml-auto">
              Gün başlığına tıklayarak tümünü seç/kaldır
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/[0.06] flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 font-medium py-2.5 rounded-xl transition-all text-sm"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <>✓ Kaydedildi</>
            ) : (
              <>
                <Save size={14} />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
