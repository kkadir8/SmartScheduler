"use client";

import { useState, useCallback } from "react";
import {
  CalendarCog,
  Sparkles,
  Play,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Dna,
  CheckCircle2,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

interface ScheduleEntry {
  id: number;
  courseId: number;
  classroomId: number;
  dayOfWeek: number; // 0=Pazartesi…4=Cuma
  startHour: number;
  durationHours: number;
  course?: { name: string; code: string };
  classroom?: { name: string };
  instructor?: { name: string };
}

interface FitnessData {
  fitnessPercent: number;
  conflictCount: number;
  bestGeneration: number;
  totalGenerations: number;
  fitnessHistory: number[];
  elapsedMs: number;
}

const ENTRY_COLORS = [
  { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-300" },
  { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-300" },
  { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300" },
  { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-300" },
  { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300" },
  { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-300" },
  { bg: "bg-accent/20", border: "border-accent/40", text: "text-accent" },
];

function getColor(idx: number) {
  return ENTRY_COLORS[idx % ENTRY_COLORS.length];
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-accent animate-pulse2"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

function FitnessChart({ history }: { history: number[] }) {
  if (history.length < 2) return null;
  const w = 400;
  const h = 80;
  const pad = 8;
  const max = Math.max(...history, 0.0001);
  const points = history.map((v, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${pad},${h - pad} L ${points.join(" L ")} L ${pad + (w - pad * 2)},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c6af7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7c6af7" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#fg)" />
      <path d={pathD} fill="none" stroke="#7c6af7" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={pad + (w - pad * 2)}
        cy={h - pad - (history[history.length - 1] / max) * (h - pad * 2)}
        r="3"
        fill="#7c6af7"
      />
    </svg>
  );
}

function CalendarView({ entries }: { entries: ScheduleEntry[] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Get Monday of current week + offset
  const getMonday = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff + offset * 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const monday = getMonday(weekOffset);
  const weekLabel = (() => {
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return `${monday.getDate()} ${monday.toLocaleString("tr-TR", { month: "short" })} – ${friday.getDate()} ${friday.toLocaleString("tr-TR", { month: "short", year: "numeric" })}`;
  })();

  // Build lookup: entries[dayOfWeek][startHour] = entry[]
  const entryMap: Record<number, Record<number, { entry: ScheduleEntry; colorIdx: number }[]>> = {};
  const courseColorMap: Record<number, number> = {};
  let colorCounter = 0;

  entries.forEach((e) => {
    if (!(e.courseId in courseColorMap)) {
      courseColorMap[e.courseId] = colorCounter++;
    }
    if (!entryMap[e.dayOfWeek]) entryMap[e.dayOfWeek] = {};
    if (!entryMap[e.dayOfWeek][e.startHour]) entryMap[e.dayOfWeek][e.startHour] = [];
    entryMap[e.dayOfWeek][e.startHour].push({ entry: e, colorIdx: courseColorMap[e.courseId] });
  });

  return (
    <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Week nav */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/80 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-white/70">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/80 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className="w-14 p-2" />
              {DAYS.map((day, i) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                const isToday =
                  weekOffset === 0 &&
                  new Date().toDateString() === date.toDateString();
                return (
                  <th key={day} className="p-2 text-center">
                    <div className={`text-xs font-semibold ${isToday ? "text-accent" : "text-white/50"}`}>
                      {day.slice(0, 3)}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isToday ? "text-accent/70" : "text-white/25"}`}>
                      {date.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-t border-white/[0.04]">
                <td className="text-[11px] text-white/25 text-right pr-3 py-2 font-mono align-top pt-2.5">
                  {hour}:00
                </td>
                {DAYS.map((_, dayIdx) => {
                  const cells = entryMap[dayIdx]?.[hour] ?? [];
                  // Check if this hour is covered by an entry that started earlier
                  const isCovered = HOURS.slice(0, HOURS.indexOf(hour)).some((h) =>
                    (entryMap[dayIdx]?.[h] ?? []).some(
                      ({ entry }) => h + entry.durationHours > hour
                    )
                  );
                  if (isCovered) return null;

                  return (
                    <td
                      key={dayIdx}
                      className="p-1 align-top"
                      style={{ minHeight: "40px" }}
                    >
                      {cells.map(({ entry, colorIdx }) => {
                        const c = getColor(colorIdx);
                        const heightClass = entry.durationHours >= 2 ? "min-h-[76px]" : "min-h-[36px]";
                        return (
                          <div
                            key={entry.id}
                            className={`${c.bg} border ${c.border} rounded-lg px-2 py-1.5 ${heightClass} flex flex-col justify-between`}
                          >
                            <div className={`text-[10px] font-semibold ${c.text} leading-tight truncate`}>
                              {entry.course?.code ?? `Ders ${entry.courseId}`}
                            </div>
                            {entry.course?.name && (
                              <div className="text-[9px] text-white/40 leading-tight truncate mt-0.5">
                                {entry.course.name}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={8} className="text-white/25" />
                              <span className="text-[9px] text-white/30">
                                {hour}:00–{hour + entry.durationHours}:00
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);

  const generate = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    setFitnessData(null);
    try {
      const res = await fetch(`${API_BASE}/api/schedule/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Sunucu hatası (${res.status})`);
      }
      const data = await res.json();
      // API { entries: [...] } ya da direkt dizi dönebilir
      setEntries(Array.isArray(data) ? data : data.entries ?? []);
      if (!Array.isArray(data) && data.fitnessHistory) {
        setFitnessData({
          fitnessPercent: data.fitnessPercent ?? 0,
          conflictCount: data.conflictCount ?? 0,
          bestGeneration: data.bestGeneration ?? 0,
          totalGenerations: data.totalGenerations ?? 0,
          fitnessHistory: data.fitnessHistory ?? [],
          elapsedMs: data.elapsedMs ?? 0,
        });
      }
      setStatus("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
      setStatus("error");
    }
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <CalendarCog size={22} className="text-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Program Oluşturucu</h2>
            <StatusBadge variant="success">Sprint 3</StatusBadge>
          </div>
          <p className="text-sm text-white/40">
            AI destekli genetik algoritma ile otomatik ders programı oluşturma
          </p>
        </div>
      </div>

      {/* Generate card */}
      <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Program Oluştur</h3>
            <p className="text-xs text-white/40">
              Hoca müsaitlikleri ve derslik kısıtlarına göre haftalık program otomatik hesaplanır.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={status === "loading"}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-accent/20"
          >
            {status === "loading" ? (
              <>
                <LoadingDots />
                <span>Hesaplanıyor...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                Programı Oluştur
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="mt-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-rose-300">Program oluşturulamadı</div>
              <div className="text-xs text-rose-400/70 mt-0.5">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* Success summary */}
        {status === "success" && (
          <div className="mt-4 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <Sparkles size={16} className="text-emerald-400 flex-shrink-0" />
            <div className="text-sm text-emerald-300">
              <span className="font-semibold">{entries.length}</span> ders başarıyla planlandı.
            </div>
          </div>
        )}
      </div>

      {/* Fitness Stats */}
      {status === "success" && fitnessData && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Dna size={14} className="text-accent" />
            <h3 className="text-sm font-semibold text-white">Genetik Algoritma Sonuçları</h3>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Fitness Skoru",
                value: `${fitnessData.fitnessPercent}%`,
                icon: <TrendingUp size={14} className="text-accent" />,
                color: "text-accent",
              },
              {
                label: "Çakışma",
                value: fitnessData.conflictCount === 0 ? "Yok" : `${fitnessData.conflictCount}`,
                icon: <CheckCircle2 size={14} className={fitnessData.conflictCount === 0 ? "text-emerald-400" : "text-rose-400"} />,
                color: fitnessData.conflictCount === 0 ? "text-emerald-400" : "text-rose-400",
              },
              {
                label: "En İyi Nesil",
                value: `#${fitnessData.bestGeneration}`,
                icon: <Dna size={14} className="text-purple-400" />,
                color: "text-purple-400",
              },
              {
                label: "Toplam Nesil",
                value: fitnessData.totalGenerations.toString(),
                icon: <Sparkles size={14} className="text-orange-400" />,
                color: "text-orange-400",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-cardbg border border-white/[0.06] rounded-xl px-4 py-3 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 text-white/40">
                  {m.icon}
                  <span className="text-[11px]">{m.label}</span>
                </div>
                <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Fitness history chart */}
          {fitnessData.fitnessHistory.length > 1 && (
            <div className="bg-cardbg border border-white/[0.06] rounded-xl px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-white/40">Nesil başına fitness değişimi</span>
                <span className="text-[11px] font-mono text-accent">
                  {fitnessData.fitnessHistory.length} nesil
                  {fitnessData.elapsedMs > 0 && ` · ${fitnessData.elapsedMs}ms`}
                </span>
              </div>
              <FitnessChart history={fitnessData.fitnessHistory} />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/20">Nesil 1</span>
                <span className="text-[10px] text-white/20">Nesil {fitnessData.fitnessHistory.length}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar */}
      {status === "success" && entries.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <h3 className="text-sm font-semibold text-white">Haftalık Program</h3>
          </div>
          <CalendarView entries={entries} />
        </div>
      )}

      {/* Empty calendar placeholder when idle */}
      {status === "idle" && (
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
          <CalendarCog size={36} className="text-white/10" />
          <p className="text-sm text-white/25">
            Programı oluşturmak için yukarıdaki butona tıklayın.
          </p>
        </div>
      )}
    </div>
  );
}
