"use client";

import { useState, useCallback, useEffect } from "react";
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
  X
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import CalendarView, { ScheduleEntry } from "../components/CalendarView";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface FitnessData {
  fitnessPercent: number;
  conflictCount: number;
  bestGeneration: number;
  totalGenerations: number;
  fitnessHistory: number[];
  elapsedMs: number;
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

export default function SchedulePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);

  // Kayıt Modalı state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: "", term: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...saveForm,
        entries,
        fitnessPercent: fitnessData?.fitnessPercent,
        conflictCount: fitnessData?.conflictCount
      };

      const res = await fetch(`${API_BASE}/api/schedule/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSaveModal(false);
        setSaveForm({ name: "", term: "" });
        alert("Program başarıyla kaydedildi!");
      } else {
        alert("Kaydetme işlemi başarısız oldu.");
      }
    } catch (err) {
      alert("Sunucu ile bağlantı kurulamadı.");
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
              <StatusBadge variant="success">Sprint 3</StatusBadge>
            </div>
            <p className="text-sm text-white/40">
              AI destekli genetik algoritma ile otomatik ders programı oluşturma
            </p>
          </div>
        </div>
        
        {/* Programı Kaydet Butonu - Sadece başarı durumunda görünür */}
        {status === "success" && entries.length > 0 && (
           <button
             onClick={() => setShowSaveModal(true)}
             className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold"
           >
             <Save size={16} />
             Programı Kaydet
           </button>
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
