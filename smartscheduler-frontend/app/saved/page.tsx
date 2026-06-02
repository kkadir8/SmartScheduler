"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Save, CalendarDays, Trash2, CheckCircle2, ChevronRight, X, FileText, FileSpreadsheet } from "lucide-react";
import CalendarView, { ScheduleEntry } from "../components/CalendarView";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface SavedSchedule {
  id: number;
  name: string;
  term: string;
  fitnessPercent: number;
  createdAt: string;
  courseCount: number;
  isActive: boolean;
}

export default function SavedSchedulesPage() {
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<ScheduleEntry[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/schedule/list`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error("Programlar çekilirken hata oluştu", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    setMounted(true);
  }, []);

  const handleActivate = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/schedule/activate/${id}`, { method: "PUT" });
      if (res.ok) fetchSchedules();
    } catch (err) {
      alert("Aktifleştirme sırasında hata oluştu.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu programı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/schedule/${id}`, { method: "DELETE" });
      if (res.ok) fetchSchedules();
    } catch (err) {
      alert("Silme işlemi başarısız.");
    }
  };

  const loadScheduleDetails = async (id: number) => {
    setSelectedScheduleId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE}/api/schedule/${id}`);
      if (res.ok) {
        const data = await res.json();
        // API formatına göre data.entries veya data objesinin kendisi kullanılabilir
        setSelectedEntries(Array.isArray(data) ? data : data.entries ?? []);
      }
    } catch (err) {
      alert("Takvim detayları çekilemedi.");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Save size={22} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Kayıtlı Programlar</h2>
          <p className="text-sm text-white/40">Daha önce oluşturulup kaydedilmiş takvimleri yönetin.</p>
        </div>
      </div>

      <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-white/40 text-sm animate-pulse">Yükleniyor...</div>
        ) : schedules.length === 0 ? (
          <div className="p-10 text-center text-white/40 text-sm">Henüz kayıtlı program bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-white/50">Program Adı</th>
                  <th className="p-4 text-xs font-semibold text-white/50">Dönem</th>
                  <th className="p-4 text-xs font-semibold text-white/50">Fitness</th>
                  <th className="p-4 text-xs font-semibold text-white/50">Tarih</th>
                  <th className="p-4 text-xs font-semibold text-white/50">Ders Sayısı</th>
                  <th className="p-4 text-xs font-semibold text-white/50 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{s.name}</span>
                        {s.isActive && (
                          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 size={10} /> Aktif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white/70">{s.term}</td>
                    <td className="p-4 text-sm text-accent font-semibold">{s.fitnessPercent}%</td>
                    <td className="p-4 text-sm text-white/50">{new Date(s.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="p-4 text-sm text-white/70">{s.courseCount}</td>
                    <td className="p-4 text-right space-x-2 flex items-center justify-end">
                      {!s.isActive && (
                        <button 
                          onClick={() => handleActivate(s.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg transition-colors"
                        >
                          Aktif Yap
                        </button>
                      )}
                      <button 
                        onClick={() => window.open(`${API_BASE}/api/export/schedules/${s.id}/pdf`, '_blank')}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors inline-flex items-center gap-1 ml-1"
                      >
                        PDF İndir <FileText size={12} />
                      </button>
                      <button 
                        onClick={() => window.open(`${API_BASE}/api/export/schedules/${s.id}/excel`, '_blank')}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors ml-1"
                        title="Excel İndir"
                      >
                        <FileSpreadsheet size={16} />
                      </button>
                      <button 
                        onClick={() => loadScheduleDetails(s.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors inline-flex items-center gap-1 ml-1"
                      >
                        Görüntüle <ChevronRight size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors ml-1"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* Takvim Detay Modalı */}
      {mounted && selectedScheduleId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-cardbg border border-white/[0.08] p-1 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-40px)]">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays size={18} className="text-accent" /> 
                Program Takvimi
              </h3>
              <button 
                onClick={() => setSelectedScheduleId(null)} 
                className="p-1.5 text-white/40 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {loadingDetails ? (
                <div className="flex justify-center p-10 text-white/40 text-sm">Takvim yükleniyor...</div>
              ) : (
                <CalendarView entries={selectedEntries} />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
