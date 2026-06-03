"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  CalendarCog,
  Sparkles,
  Play,
  AlertCircle,
  TrendingUp,
  Dna,
  CheckCircle2,
  Save,
  X,
  LayoutGrid,
  User,
  DoorOpen,
} from "lucide-react";
import CalendarView from "@/components/CalendarView";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { useClassrooms } from "@/hooks/useClassrooms";
import { API_BASE, DAYS } from "@/lib/constants";
import type { FitnessData, ScheduleEntry, ConflictItem } from "@/types";

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

function detectConflictsFromEntries(entries: ScheduleEntry[]): ConflictItem[] {
  const conflicts: ConflictItem[] = [];
  const slotMap = new Map<string, ScheduleEntry[]>();

  entries.forEach(e => {
    const key = `${e.dayOfWeek}-${e.startHour}`;
    slotMap.set(key, [...(slotMap.get(key) ?? []), e]);
  });

  slotMap.forEach((group, key) => {
    if (group.length <= 1) return;
    const [day, hour] = key.split("-").map(Number);

    const roomGroups = new Map<number, ScheduleEntry[]>();
    group.forEach(e => roomGroups.set(e.classroomId, [...(roomGroups.get(e.classroomId) ?? []), e]));
    roomGroups.forEach((rg, classroomId) => {
      if (rg.length > 1)
        conflicts.push({ type: "room", day, hour, classroomId, courseIds: rg.map(e => e.courseId) });
    });

    const instrGroups = new Map<number, ScheduleEntry[]>();
    group.filter(e => e.instructorId && e.instructorId !== 0)
      .forEach(e => instrGroups.set(e.instructorId!, [...(instrGroups.get(e.instructorId!) ?? []), e]));
    instrGroups.forEach((ig, instructorId) => {
      if (ig.length > 1)
        conflicts.push({ type: "instructor", day, hour, instructorId, courseIds: ig.map(e => e.courseId) });
    });
  });

  return conflicts;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { classrooms } = useClassrooms();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);

  // "Kimin programı" görünümü — master programı hoca/derslik bazında süzer
  const [viewMode, setViewMode] = useState<"all" | "instructor" | "classroom">("all");
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);

  // Kayıt Modalı state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: "", term: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generate = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    setFitnessData(null);
    setViewMode("all");
    setSelectedInstructor(null);
    setSelectedClassroom(null);
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
      const parsedEntries: ScheduleEntry[] = Array.isArray(data) ? data : data.entries ?? [];
      setEntries(parsedEntries);
      if (!Array.isArray(data) && data.fitnessHistory) {
        // Eğer API yeni sürümdeyse conflicts döner; yoksa client-side hesapla
        const conflicts: ConflictItem[] = data.conflicts?.length > 0
          ? data.conflicts
          : detectConflictsFromEntries(parsedEntries);
        setFitnessData({
          fitnessPercent: data.fitnessPercent ?? 0,
          conflictCount: data.conflictCount ?? 0,
          conflicts,
          bestGeneration: data.bestGeneration ?? 0,
          totalGenerations: data.totalGenerations ?? 0,
          fitnessHistory: data.fitnessHistory ?? [],
          elapsedMs: data.elapsedMs ?? 0,
        });
        setShowConflicts(false);
      }
      setStatus("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
      setStatus("error");
    }
  }, []);

  // Programda yer alan hocalar (ada göre sıralı)
  const instructorOptions = useMemo(() => {
    const ids = Array.from(
      new Set(entries.map((e) => e.instructorId).filter((x): x is number => !!x))
    );
    return ids
      .map((id) => ({
        id,
        name: courses.find((c) => c.instructorId === id)?.instructorName ?? `Hoca #${id}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [entries, courses]);

  // Programda yer alan derslikler
  const classroomOptions = useMemo(() => {
    const ids = Array.from(new Set(entries.map((e) => e.classroomId)));
    return ids
      .map((id) => ({
        id,
        name: classrooms.find((c) => c.id === id)?.name ?? `Derslik #${id}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [entries, classrooms]);

  // Seçili görünüme göre süzülmüş + ders/derslik adıyla zenginleştirilmiş program
  // (CalendarView'da "Ders 3" yerine "MAT101 — Matematik" görünür)
  const filteredEntries = useMemo(() => {
    const base =
      viewMode === "instructor" && selectedInstructor
        ? entries.filter((e) => e.instructorId === selectedInstructor)
        : viewMode === "classroom" && selectedClassroom
          ? entries.filter((e) => e.classroomId === selectedClassroom)
          : entries;

    return base.map((e) => {
      const c = courses.find((x) => x.id === e.courseId);
      const cl = classrooms.find((x) => x.id === e.classroomId);
      return {
        ...e,
        course: e.course ?? (c ? { code: c.code, name: c.name } : undefined),
        classroom: e.classroom ?? (cl ? { name: cl.name } : undefined),
        instructor: e.instructor ?? (c?.instructorName ? { name: c.instructorName } : undefined),
      };
    });
  }, [entries, viewMode, selectedInstructor, selectedClassroom, courses, classrooms]);

  const viewTitle = useMemo(() => {
    if (viewMode === "instructor" && selectedInstructor)
      return `${instructorOptions.find((o) => o.id === selectedInstructor)?.name ?? "Hoca"} — Ders Programı`;
    if (viewMode === "classroom" && selectedClassroom)
      return `${classroomOptions.find((o) => o.id === selectedClassroom)?.name ?? "Derslik"} — Derslik Programı`;
    return "Tüm Bölüm Programı";
  }, [viewMode, selectedInstructor, selectedClassroom, instructorOptions, classroomOptions]);

  // Sekme değişince ilgili dropdown'ın ilk değerini otomatik seç
  const selectView = (mode: "all" | "instructor" | "classroom") => {
    setViewMode(mode);
    if (mode === "instructor") setSelectedInstructor(instructorOptions[0]?.id ?? null);
    if (mode === "classroom") setSelectedClassroom(classroomOptions[0]?.id ?? null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...saveForm,
        entries,
        fitnessPercent: fitnessData?.fitnessPercent,
      };

      const res = await fetch(`${API_BASE}/api/schedule/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSaveModal(false);
        setSaveForm({ name: "", term: "" });
        setSaveError("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        const body = await res.json().catch(() => ({}));
        setSaveError(body.message ?? "Kaydetme işlemi başarısız oldu.");
      }
    } catch {
      setSaveError("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <CalendarCog size={22} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">Program Oluşturucu</h2>
            </div>
            <p className="text-sm text-white/40">
              AI destekli genetik algoritma ile otomatik ders programı oluşturma
            </p>
          </div>
        </div>
        
        {/* Programı Kaydet Butonu - Sadece başarı durumunda görünür */}
        {status === "success" && entries.length > 0 && (
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium animate-fadeIn">
                <CheckCircle2 size={15} /> Kaydedildi
              </span>
            )}
            <button
              onClick={() => { setShowSaveModal(true); setSaveError(""); }}
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold"
            >
              <Save size={16} />
              Programı Kaydet
            </button>
          </div>
        )}
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

      {/* Conflict Detail Panel */}
      {status === "success" && fitnessData && fitnessData.conflictCount > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl overflow-hidden animate-fadeIn">
          <button
            onClick={() => setShowConflicts(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-rose-500/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-400" />
              <span className="text-sm font-semibold text-rose-300">
                {fitnessData.conflictCount} çakışma tespit edildi
              </span>
              <span className="text-xs text-rose-400/60">— hangi dersler çakışıyor?</span>
            </div>
            <span className="text-xs text-rose-400/60">{showConflicts ? "Gizle ▲" : "Göster ▼"}</span>
          </button>

          {showConflicts && fitnessData.conflicts && fitnessData.conflicts.length > 0 && (
            <div className="px-5 pb-4 space-y-2 border-t border-rose-500/10">
              {fitnessData.conflicts.map((c: ConflictItem, i: number) => {
                const dayName = DAYS[c.day] ?? `Gün ${c.day}`;
                const courseNames = c.courseIds.map(id => {
                  const course = courses.find(cr => cr.id === id);
                  return course ? `${course.code}` : `#${id}`;
                });
                const classroom = c.classroomId
                  ? classrooms.find(cl => cl.id === c.classroomId)
                  : null;

                return (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-rose-500/[0.08] last:border-0">
                    <span className={`mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.type === "room"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    }`}>
                      {c.type === "room" ? "SALON" : "HOCA"}
                    </span>
                    <div>
                      <p className="text-sm text-white/80">
                        <span className="font-semibold text-rose-300">{dayName} {c.hour}:00</span>
                        {" — "}
                        {courseNames.join(" ve ")} çakışıyor
                      </p>
                      {classroom && (
                        <p className="text-xs text-white/40 mt-0.5">{classroom.name} — {classroom.building}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar */}
      {status === "success" && entries.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              <h3 className="text-sm font-semibold text-white">{viewTitle}</h3>
              <span className="text-xs text-white/30">({filteredEntries.length} ders)</span>
            </div>

            {/* Görünüm sekmeleri */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
              {[
                { mode: "all" as const, label: "Tüm Program", icon: LayoutGrid },
                { mode: "instructor" as const, label: "Hocaya Göre", icon: User },
                { mode: "classroom" as const, label: "Dersliğe Göre", icon: DoorOpen },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => selectView(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === mode
                      ? "bg-accent/15 text-accent"
                      : "text-white/45 hover:text-white/80"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Hoca / derslik seçici */}
          {viewMode === "instructor" && (
            <select
              value={selectedInstructor ?? ""}
              onChange={(e) => setSelectedInstructor(Number(e.target.value))}
              className="bg-cardbg border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-accent/50 min-w-[220px]"
            >
              {instructorOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
          {viewMode === "classroom" && (
            <select
              value={selectedClassroom ?? ""}
              onChange={(e) => setSelectedClassroom(Number(e.target.value))}
              className="bg-cardbg border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-accent/50 min-w-[220px]"
            >
              {classroomOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}

          {filteredEntries.length > 0 ? (
            <CalendarView entries={filteredEntries} />
          ) : (
            <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-8 text-center text-sm text-white/30">
              Bu görünümde ders bulunamadı.
            </div>
          )}
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

      {/* Kayıt Modalı */}
      {mounted && showSaveModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-cardbg border border-white/[0.08] p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[calc(100vh-40px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Programı Kaydet</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {saveError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5 text-xs text-rose-300">
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-xs text-white/50 mb-1">Program Adı</label>
                <input 
                  type="text" 
                  required
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({...saveForm, name: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent"
                  placeholder="Örn: 2025 Bahar Ana Program"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Dönem</label>
                <input 
                  type="text" 
                  required
                  value={saveForm.term}
                  onChange={(e) => setSaveForm({...saveForm, term: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent"
                  placeholder="Örn: Güz 2024"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/[0.05]"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <LoadingDots /> : <Save size={14} />}
                  {isSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
