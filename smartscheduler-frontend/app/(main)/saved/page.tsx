"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Save, CalendarDays, Trash2, CheckCircle2, ChevronRight, X,
  FileText, FileSpreadsheet, AlertCircle, GitCompare, Pencil, Clock,
} from "lucide-react";
import CalendarView from "@/components/CalendarView";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, DAYS, HOURS } from "@/lib/constants";
import type { SavedSchedule, ScheduleEntry } from "@/types";

type Toast = { msg: string; type: "success" | "error" };
type EditTarget = { entryId: number; scheduleId: number; dayOfWeek: number; startHour: number };

export default function SavedSchedulesPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Görüntüleme
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<ScheduleEntry[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Düzenleme
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editForm, setEditForm] = useState({ dayOfWeek: 0, startHour: 8 });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Karşılaştırma
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareData, setCompareData] = useState<[ScheduleEntry[], ScheduleEntry[]] | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const showToast = (msg: string, type: Toast["type"]) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/schedule/list`);
      if (res.ok) setSchedules(await res.json());
    } catch {
      showToast("Programlar yüklenirken hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); setMounted(true); }, []);

  const authHeaders = () => ({
    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
  });

  const handleActivate = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/schedule/${id}/activate`, { method: "PUT", headers: authHeaders() });
      if (res.ok) { fetchSchedules(); showToast("Program aktif olarak işaretlendi.", "success"); }
      else showToast("Aktifleştirme başarısız oldu.", "error");
    } catch { showToast("Aktifleştirme sırasında hata oluştu.", "error"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu programı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/schedule/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) { fetchSchedules(); showToast("Program silindi.", "success"); }
      else showToast("Silme işlemi başarısız.", "error");
    } catch { showToast("Silme işlemi başarısız.", "error"); }
  };

  const loadScheduleDetails = async (id: number) => {
    setSelectedScheduleId(id);
    setEditMode(false);
    setEditTarget(null);
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE}/api/schedule/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEntries(Array.isArray(data) ? data : data.entries ?? []);
      }
    } catch { showToast("Takvim detayları çekilemedi.", "error"); }
    finally { setLoadingDetails(false); }
  };

  // ── Düzenleme ──────────────────────────────────────────────────────────────
  const openEdit = (entry: ScheduleEntry) => {
    if (!selectedScheduleId) return;
    setEditTarget({ entryId: entry.id, scheduleId: selectedScheduleId, dayOfWeek: entry.dayOfWeek, startHour: entry.startHour });
    setEditForm({ dayOfWeek: entry.dayOfWeek, startHour: entry.startHour });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/schedule/${editTarget.scheduleId}/entries/${editTarget.entryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(editForm),
        }
      );
      if (res.ok) {
        setSelectedEntries(prev =>
          prev.map(e => e.id === editTarget.entryId
            ? { ...e, dayOfWeek: editForm.dayOfWeek, startHour: editForm.startHour }
            : e
          )
        );
        setEditTarget(null);
        showToast("Ders taşındı.", "success");
      } else {
        showToast("Güncelleme başarısız.", "error");
      }
    } catch { showToast("Sunucu ile bağlantı kurulamadı.", "error"); }
    finally { setIsSavingEdit(false); }
  };

  // ── Karşılaştırma ──────────────────────────────────────────────────────────
  const toggleCompare = (id: number) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
      : prev.length < 2 ? [...prev, id]
      : prev
    );
  };

  const loadComparison = async () => {
    if (compareIds.length !== 2) return;
    setLoadingCompare(true);
    try {
      const [r1, r2] = await Promise.all(
        compareIds.map(id => fetch(`${API_BASE}/api/schedule/${id}`).then(r => r.json()))
      );
      setCompareData([r1.entries ?? [], r2.entries ?? []]);
      setShowCompare(true);
    } catch { showToast("Karşılaştırma verisi yüklenemedi.", "error"); }
    finally { setLoadingCompare(false); }
  };

  const getScheduleById = (id: number) => schedules.find(s => s.id === id);

  // ── Yardımcı ──────────────────────────────────────────────────────────────
  const getCourseName = (entry: ScheduleEntry) =>
    entry.course ? `${entry.course.code} — ${entry.course.name}` : `Ders #${entry.courseId}`;

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Save size={22} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Kayıtlı Programlar</h2>
              <p className="text-sm text-white/40">Daha önce oluşturulup kaydedilmiş takvimleri yönetin.</p>
            </div>
          </div>

          {compareIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{compareIds.length}/2 seçildi</span>
              <button
                onClick={loadComparison}
                disabled={compareIds.length !== 2 || loadingCompare}
                className="flex items-center gap-2 bg-accent/20 hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed border border-accent/30 text-accent px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <GitCompare size={14} />
                {loadingCompare ? "Yükleniyor..." : "Karşılaştır"}
              </button>
              <button onClick={() => setCompareIds([])} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
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
                    <th className="p-4 w-10">
                      <span className="text-[10px] text-white/30 font-medium">KAR.</span>
                    </th>
                    <th className="p-4 text-xs font-semibold text-white/50">Program Adı</th>
                    <th className="p-4 text-xs font-semibold text-white/50">Dönem</th>
                    <th className="p-4 text-xs font-semibold text-white/50">Fitness</th>
                    <th className="p-4 text-xs font-semibold text-white/50">Tarih</th>
                    <th className="p-4 text-xs font-semibold text-white/50">Ders</th>
                    <th className="p-4 text-xs font-semibold text-white/50 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => {
                    const isSelected = compareIds.includes(s.id);
                    const isDisabled = !isSelected && compareIds.length >= 2;
                    return (
                      <tr key={s.id} className={`border-b border-white/[0.04] transition-colors ${isSelected ? "bg-accent/5" : "hover:bg-white/[0.02]"}`}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => toggleCompare(s.id)}
                            className="w-4 h-4 accent-accent cursor-pointer disabled:opacity-30"
                          />
                        </td>
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
                        <td className="p-4 text-right flex items-center justify-end gap-1 flex-wrap">
                          {!s.isActive && (
                            <button onClick={() => handleActivate(s.id)} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg transition-colors">
                              Aktif Yap
                            </button>
                          )}
                          <button onClick={() => window.open(`${API_BASE}/api/export/schedules/${s.id}/pdf`, "_blank")}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors inline-flex items-center gap-1">
                            PDF <FileText size={11} />
                          </button>
                          <button onClick={() => window.open(`${API_BASE}/api/export/schedules/${s.id}/excel`, "_blank")}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors" title="Excel İndir">
                            <FileSpreadsheet size={15} />
                          </button>
                          <button onClick={() => loadScheduleDetails(s.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors inline-flex items-center gap-1">
                            Görüntüle <ChevronRight size={11} />
                          </button>
                          <button onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Sil">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Görüntüleme + Düzenleme Modalı ──────────────────────────────── */}
      {mounted && selectedScheduleId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[calc(100vh-32px)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays size={18} className="text-accent" />
                {schedules.find(s => s.id === selectedScheduleId)?.name ?? "Program Takvimi"}
              </h3>
              <div className="flex items-center gap-2">
                {!loadingDetails && (
                  <button
                    onClick={() => { setEditMode(v => !v); setEditTarget(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      editMode
                        ? "bg-accent/20 border-accent/40 text-accent"
                        : "bg-white/[0.05] border-white/[0.08] text-white/60 hover:text-white"
                    }`}
                  >
                    <Pencil size={12} />
                    {editMode ? "Düzenleme Açık" : "Düzenle"}
                  </button>
                )}
                <button onClick={() => { setSelectedScheduleId(null); setEditTarget(null); setEditMode(false); }}
                  className="p-1.5 text-white/40 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all">
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingDetails ? (
                <div className="flex justify-center p-10 text-white/40 text-sm">Takvim yükleniyor...</div>
              ) : (
                <>
                  <CalendarView entries={selectedEntries} />

                  {/* Düzenleme listesi */}
                  {editMode && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/40 flex items-center gap-1.5">
                        <Pencil size={11} /> Taşımak istediğiniz derse tıklayın
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedEntries.map(entry => (
                          <button
                            key={entry.id}
                            onClick={() => openEdit(entry)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              editTarget?.entryId === entry.id
                                ? "bg-accent/10 border-accent/40"
                                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                              <Clock size={14} className="text-accent" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{getCourseName(entry)}</p>
                              <p className="text-[11px] text-white/40">
                                {DAYS[entry.dayOfWeek]} {entry.startHour}:00
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Düzenleme formu */}
                      {editTarget && (
                        <div className="bg-primary/50 border border-accent/20 rounded-xl p-4 space-y-3 animate-fadeIn">
                          <p className="text-xs font-semibold text-accent">Yeni Zaman Seç</p>
                          <div className="flex gap-3 flex-wrap">
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] text-white/40">Gün</label>
                              <select value={editForm.dayOfWeek}
                                onChange={e => setEditForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                                className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50">
                                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] text-white/40">Saat</label>
                              <select value={editForm.startHour}
                                onChange={e => setEditForm(f => ({ ...f, startHour: Number(e.target.value) }))}
                                className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50">
                                {HOURS.filter(h => h <= 17).map(h => <option key={h} value={h}>{h}:00</option>)}
                              </select>
                            </div>
                            <div className="flex items-end gap-2">
                              <button onClick={saveEdit} disabled={isSavingEdit}
                                className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5">
                                {isSavingEdit ? "Kaydediliyor..." : <><Save size={13} />Kaydet</>}
                              </button>
                              <button onClick={() => setEditTarget(null)}
                                className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg bg-white/[0.04] transition-colors">
                                İptal
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Karşılaştırma Modalı ─────────────────────────────────────────── */}
      {mounted && showCompare && compareData && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-[1200px] shadow-2xl flex flex-col max-h-[calc(100vh-32px)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitCompare size={18} className="text-accent" /> Program Karşılaştırması
              </h3>
              <button onClick={() => setShowCompare(false)}
                className="p-1.5 text-white/40 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all">
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {compareIds.map((id, idx) => {
                  const s = getScheduleById(id);
                  return (
                    <div key={id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? "bg-accent" : "bg-purple-400"}`} />
                        <span className="text-sm font-semibold text-white">{s?.name}</span>
                        <span className="text-xs text-white/40">{s?.term} · {s?.fitnessPercent}%</span>
                        {s?.isActive && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">Aktif</span>
                        )}
                      </div>
                      <CalendarView entries={compareData[idx]} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {mounted && toast && createPortal(
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fadeIn border ${
          toast.type === "success"
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/15 border-rose-500/30 text-rose-300"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>,
        document.body
      )}
    </>
  );
}
