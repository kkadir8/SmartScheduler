"use client";

import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  FlaskConical,
  GitCompare,
  CalendarOff,
  Lock,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertCircle,
  Play,
  ArrowRight,
  Timer,
} from "lucide-react";
import { API_BASE, DAYS, HOURS, LOCK_HOURS } from "@/lib/constants";
import { useCourses } from "@/hooks/useCourses";
import type { Course, ScheduleEntry, ScenarioResult, LockedAssignment } from "@/types";

const ENTRY_COLORS = [
  "bg-blue-500/20 border-blue-500/40 text-blue-300",
  "bg-purple-500/20 border-purple-500/40 text-purple-300",
  "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  "bg-orange-500/20 border-orange-500/40 text-orange-300",
  "bg-rose-500/20 border-rose-500/40 text-rose-300",
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  "bg-accent/20 border-accent/40 text-accent",
];

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

/** baseline → scenario değişimini gösteren karşılaştırma kartı. */
function DeltaCard({
  label,
  baseValue,
  newValue,
  unit = "",
  betterWhenLower = false,
  icon,
}: {
  label: string;
  baseValue: number;
  newValue: number;
  unit?: string;
  betterWhenLower?: boolean;
  icon: ReactNode;
}) {
  const delta = newValue - baseValue;
  const improved = betterWhenLower ? delta < 0 : delta > 0;
  const worsened = betterWhenLower ? delta > 0 : delta < 0;
  const color = delta === 0 ? "text-white/40" : improved ? "text-emerald-400" : "text-rose-400";
  const DeltaIcon = delta === 0 ? Minus : worsened ? TrendingDown : TrendingUp;

  return (
    <div className="bg-cardbg border border-white/[0.06] rounded-xl px-4 py-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-white/30 line-through">
          {baseValue}
          {unit}
        </span>
        <ArrowRight size={11} className="text-white/20" />
        <span className="text-lg font-bold text-white">
          {newValue}
          {unit}
        </span>
      </div>
      <div className={`flex items-center gap-1 text-[11px] font-medium ${color}`}>
        <DeltaIcon size={11} />
        <span>
          {delta > 0 ? "+" : ""}
          {delta}
          {unit} {delta === 0 ? "değişmedi" : improved ? "iyileşti" : "kötüleşti"}
        </span>
      </div>
    </div>
  );
}

/** Kompakt senaryo takvimi — değişen dersler vurgulanır. */
function ScenarioCalendar({
  entries,
  changedCourseIds,
  courseMap,
}: {
  entries: ScheduleEntry[];
  changedCourseIds: Set<number>;
  courseMap: Record<number, Course>;
}) {
  const colorOf: Record<number, string> = {};
  let counter = 0;
  entries.forEach((e) => {
    if (!(e.courseId in colorOf)) colorOf[e.courseId] = ENTRY_COLORS[counter++ % ENTRY_COLORS.length];
  });

  const cellAt = (day: number, hour: number) =>
    entries.filter((e) => e.dayOfWeek === day && e.startHour === hour);

  return (
    <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            <th className="w-14 p-2" />
            {DAYS.map((d) => (
              <th key={d} className="p-2 text-center text-xs font-semibold text-white/50">
                {d.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) => (
            <tr key={hour} className="border-t border-white/[0.04]">
              <td className="text-[11px] text-white/25 text-right pr-3 py-2 font-mono align-top pt-2.5">
                {hour}:00
              </td>
              {DAYS.map((_, dayIdx) => {
                const cells = cellAt(dayIdx, hour);
                return (
                  <td key={dayIdx} className="p-1 align-top">
                    {cells.map((entry) => {
                      const c = courseMap[entry.courseId];
                      const changed = changedCourseIds.has(entry.courseId);
                      return (
                        <div
                          key={entry.id}
                          className={`${colorOf[entry.courseId]} border rounded-lg px-2 py-1.5 min-h-[44px] flex flex-col justify-between relative ${
                            changed ? "ring-2 ring-accent/60" : ""
                          }`}
                        >
                          {changed && (
                            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                              değişti
                            </span>
                          )}
                          <div className="text-[10px] font-semibold leading-tight truncate">
                            {c?.code ?? `Ders ${entry.courseId}`}
                          </div>
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
  );
}

export default function WhatIfPage() {
  const { courses } = useCourses();
  const [excludedDays, setExcludedDays] = useState<Set<number>>(new Set());
  const [locks, setLocks] = useState<LockedAssignment[]>([]);
  const [lockForm, setLockForm] = useState({ courseId: 0, dayOfWeek: 0, startHour: 9 });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [baseline, setBaseline] = useState<ScenarioResult | null>(null);
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);

  const courseMap = courses.reduce<Record<number, Course>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});



  const toggleDay = (idx: number) => {
    setExcludedDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const addLock = () => {
    if (!lockForm.courseId) return;
    setLocks((prev) => [
      ...prev.filter((l) => l.courseId !== lockForm.courseId),
      { ...lockForm },
    ]);
  };

  const removeLock = (courseId: number) =>
    setLocks((prev) => prev.filter((l) => l.courseId !== courseId));

  const parse = async (res: Response): Promise<ScenarioResult> => {
    if (!res.ok) throw new Error((await res.text()) || `Sunucu hatası (${res.status})`);
    const d = await res.json();
    return {
      fitnessPercent: d.fitnessPercent ?? 0,
      conflictCount: d.conflictCount ?? 0,
      bestGeneration: d.bestGeneration ?? 0,
      totalGenerations: d.totalGenerations ?? 0,
      fitnessHistory: d.fitnessHistory ?? [],
      elapsedMs: d.elapsedMs ?? 0,
      stoppedEarly: d.stoppedEarly ?? false,
      entries: Array.isArray(d) ? d : d.entries ?? [],
    };
  };

  const analyze = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    setBaseline(null);
    setScenario(null);
    try {
      // 1) Baseline — kısıtsız normal program
      const baseRes = await fetch(`${API_BASE}/api/schedule/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const base = await parse(baseRes);

      // 2) Senaryo — What-if kısıtlarıyla
      const scnRes = await fetch(`${API_BASE}/api/schedule/whatif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excludedDays: Array.from(excludedDays),
          lockedAssignments: locks,
        }),
      });
      const scn = await parse(scnRes);

      setBaseline(base);
      setScenario(scn);
      setStatus("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
      setStatus("error");
    }
  }, [excludedDays, locks]);

  // Değişen dersleri tespit et (gün/saat/derslik farkı)
  const changedCourseIds = (() => {
    if (!baseline || !scenario) return new Set<number>();
    const baseMap = new Map(
      baseline.entries.map((e) => [e.courseId, `${e.dayOfWeek}-${e.startHour}-${e.classroomId}`])
    );
    const changed = new Set<number>();
    scenario.entries.forEach((e) => {
      const key = `${e.dayOfWeek}-${e.startHour}-${e.classroomId}`;
      if (baseMap.get(e.courseId) !== key) changed.add(e.courseId);
    });
    return changed;
  })();

  const hasScenario = excludedDays.size > 0 || locks.length > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <FlaskConical size={22} className="text-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">What-If Analizi</h2>
          </div>
          <p className="text-sm text-white/40">
            Gün kapatma veya ders sabitleme senaryolarının programa etkisini karşılaştırın.
          </p>
        </div>
      </div>

      {/* Senaryo kurucu */}
      <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-6 space-y-5">
        {/* Gün kapatma */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarOff size={14} className="text-accent" />
            <h3 className="text-sm font-semibold text-white">Kapalı Günler</h3>
            <span className="text-xs text-white/30">— seçilen günlere ders atanmaz</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, idx) => {
              const active = excludedDays.has(idx);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    active
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                      : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20"
                  }`}
                >
                  {active && "✕ "}
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ders sabitleme */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-accent" />
            <h3 className="text-sm font-semibold text-white">Ders Sabitle</h3>
            <span className="text-xs text-white/30">— belirli dersi sabit gün/saatte tut</span>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-white/40">Ders</label>
              <select
                value={lockForm.courseId}
                onChange={(e) => setLockForm((f) => ({ ...f, courseId: Number(e.target.value) }))}
                className="bg-primary/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 min-w-[180px] focus:outline-none focus:border-accent/50"
              >
                <option value={0}>Ders seçin…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-white/40">Gün</label>
              <select
                value={lockForm.dayOfWeek}
                onChange={(e) => setLockForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                className="bg-primary/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-accent/50"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-white/40">Saat</label>
              <select
                value={lockForm.startHour}
                onChange={(e) => setLockForm((f) => ({ ...f, startHour: Number(e.target.value) }))}
                className="bg-primary/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-accent/50"
              >
                {LOCK_HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}:00
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addLock}
              disabled={!lockForm.courseId}
              className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.08] text-white/80 px-3 py-2 rounded-lg text-sm transition-all"
            >
              <Plus size={14} />
              Ekle
            </button>
          </div>

          {/* Sabitlenen dersler */}
          {locks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {locks.map((l) => {
                const c = courseMap[l.courseId];
                return (
                  <span
                    key={l.courseId}
                    className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent text-xs px-2.5 py-1.5 rounded-lg"
                  >
                    <Lock size={11} />
                    {c?.code ?? `Ders ${l.courseId}`} · {DAYS[l.dayOfWeek]} {l.startHour}:00
                    <button onClick={() => removeLock(l.courseId)} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Analiz butonu */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-white/40">
            {hasScenario
              ? "Algoritma önce kısıtsız, sonra senaryolu çalışır ve sonuçları karşılaştırır."
              : "Karşılaştırma için en az bir gün kapatın veya ders sabitleyin."}
          </p>
          <button
            onClick={analyze}
            disabled={status === "loading" || !hasScenario}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-accent/20"
          >
            {status === "loading" ? (
              <>
                <LoadingDots />
                <span>Analiz ediliyor...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                Analiz Et
              </>
            )}
          </button>
        </div>

        {status === "error" && (
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-rose-300">Analiz başarısız</div>
              <div className="text-xs text-rose-400/70 mt-0.5">{errorMsg}</div>
            </div>
          </div>
        )}
      </div>

      {/* Karşılaştırma */}
      {status === "success" && baseline && scenario && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <GitCompare size={14} className="text-accent" />
            <h3 className="text-sm font-semibold text-white">Karşılaştırma</h3>
            <span className="text-xs text-white/30">kısıtsız → senaryo</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <DeltaCard
              label="Fitness Skoru"
              baseValue={baseline.fitnessPercent}
              newValue={scenario.fitnessPercent}
              unit="%"
              icon={<TrendingUp size={14} className="text-accent" />}
            />
            <DeltaCard
              label="Çakışma"
              baseValue={baseline.conflictCount}
              newValue={scenario.conflictCount}
              betterWhenLower
              icon={<AlertCircle size={14} className="text-purple-400" />}
            />
            <DeltaCard
              label="Çalışma Süresi"
              baseValue={baseline.elapsedMs}
              newValue={scenario.elapsedMs}
              unit="ms"
              betterWhenLower
              icon={<Timer size={14} className="text-orange-400" />}
            />
            <div className="bg-cardbg border border-white/[0.06] rounded-xl px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-white/40">
                <GitCompare size={14} className="text-cyan-400" />
                <span className="text-[11px]">Yeri Değişen Ders</span>
              </div>
              <div className="text-lg font-bold text-white">
                {changedCourseIds.size}
                <span className="text-sm text-white/40 font-normal"> / {scenario.entries.length}</span>
              </div>
              <span className="text-[11px] text-white/30">senaryoda farklı konuma taşındı</span>
            </div>
          </div>

          {scenario.stoppedEarly && (
            <div className="flex items-center gap-2 text-[11px] text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
              <Timer size={12} className="text-emerald-400" />
              Senaryo erken durdu: {scenario.totalGenerations} nesilde optimuma yakınsadı (boşa
              hesaplama yapılmadı).
            </div>
          )}

          {/* Senaryo takvimi */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <FlaskConical size={14} className="text-accent" />
              <h3 className="text-sm font-semibold text-white">Senaryo Programı</h3>
              <span className="flex items-center gap-1 text-[11px] text-white/30">
                <span className="inline-block w-2.5 h-2.5 rounded-sm ring-2 ring-accent/60" />
                değişen dersler vurgulu
              </span>
            </div>
            <ScenarioCalendar
              entries={scenario.entries}
              changedCourseIds={changedCourseIds}
              courseMap={courseMap}
            />
          </div>
        </div>
      )}

      {/* Idle */}
      {status === "idle" && (
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
          <FlaskConical size={36} className="text-white/10" />
          <p className="text-sm text-white/25">
            Bir senaryo tanımlayın ve “Analiz Et” ile etkisini görün.
          </p>
        </div>
      )}
    </div>
  );
}
