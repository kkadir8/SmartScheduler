"use client";

import { useState } from "react";
import { DoorOpen, Users, Monitor, Plus, Pencil, Trash2, Download } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import ApiError from "@/components/ApiError";
import ClassroomModal from "@/components/modals/ClassroomModal";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useClassrooms } from "@/hooks/useClassrooms";
import { API_BASE } from "@/lib/constants";
import type { Classroom } from "@/types";

function capacityVariant(pct: number): "success" | "warning" | "error" {
  if (pct < 60) return "success";
  if (pct < 85) return "warning";
  return "error";
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-xl skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 rounded skeleton" />
        <div className="h-3 w-20 rounded skeleton" />
      </div>
      <div className="w-24 h-2 rounded-full skeleton" />
      <div className="w-16 h-5 rounded-full skeleton" />
    </div>
  );
}

export default function ClassroomsPage() {
  const { user, logout } = useAuth();
  const { classrooms, loading, error, refetch: refetchClassrooms } = useClassrooms();
  const [deleteError, setDeleteError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClassroom, setEditClassroom] = useState<Classroom | null>(null);

  const api = <T,>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, token: user?.token, onUnauthorized: logout });

  const handleSave = async (classroom: { id?: number; name: string; building: string; capacity: number; hasLab: boolean; hasProjector: boolean }) => {
    const method = classroom.id ? "PUT" : "POST";
    const endpoint = classroom.id ? `/api/classrooms/${classroom.id}` : "/api/classrooms";
    const { error: err } = await api(endpoint, { method, body: JSON.stringify(classroom) });
    if (err) throw new Error(err);
    setShowModal(false);
    setEditClassroom(null);
    refetchClassrooms();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu sınıfı silmek istediğinizden emin misiniz?")) return;
    setDeleteError("");
    const { error: err } = await api(`/api/classrooms/${id}`, { method: "DELETE" });
    if (err) { setDeleteError(err); return; }
    refetchClassrooms();
  };

  const labCount = classrooms.filter((c) => c.hasLab).length;
  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Derslikler</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {loading ? "Yükleniyor..." : `${classrooms.length} derslik — toplam ${totalCapacity} kişilik kapasite`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && !error && (
            <>
              <div className="flex items-center gap-1.5 bg-cardbg border border-white/[0.06] px-3 py-1.5 rounded-xl hidden sm:flex">
                <Monitor size={13} className="text-purple-400" />
                <span className="text-xs text-white/50">{labCount} Lab</span>
              </div>
              <div className="flex items-center gap-1.5 bg-cardbg border border-white/[0.06] px-3 py-1.5 rounded-xl hidden sm:flex">
                <DoorOpen size={13} className="text-blue-400" />
                <span className="text-xs text-white/50">{classrooms.length - labCount} Sınıf</span>
              </div>
            </>
          )}
          <button
            onClick={() => window.open(`${API_BASE}/api/export/classrooms/excel`, '_blank')}
            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-2 rounded-xl border border-emerald-500/30 transition-colors"
          >
            <Download size={15} />
            Excel
          </button>
          {user && (
            <button onClick={() => { setEditClassroom(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <Plus size={15} />
              Yeni Sınıf
            </button>
          )}
        </div>
      </div>

      {deleteError && (
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
          <span className="text-xs text-rose-300">{deleteError}</span>
          <button onClick={() => setDeleteError("")} className="text-rose-300/50 hover:text-rose-300 ml-3 text-lg leading-none">×</button>
        </div>
      )}

      {error ? (
        <ApiError onRetry={refetchClassrooms} />
      ) : (
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06]">
            <div className="w-10" />
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Sınıf Adı</div>
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Kapasite</div>
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Tür</div>
            <div className="w-16" />
          </div>

          <div className="divide-y divide-white/[0.04]">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : classrooms.map((classroom, idx) => {
                  const maxCapacity = 60;
                  const pct = Math.round((classroom.capacity / maxCapacity) * 100);
                  const variant = capacityVariant(pct);
                  return (
                    <div key={classroom.id}
                      className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors group animate-fadeIn"
                      style={{ animationDelay: `${idx * 40}ms` }}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${classroom.hasLab ? "bg-purple-500/10 border border-purple-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
                        {classroom.hasLab ? <Monitor size={16} className="text-purple-400" /> : <DoorOpen size={16} className="text-blue-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{classroom.name}</div>
                        {classroom.building && <div className="text-[11px] text-white/30 mt-0.5">{classroom.building}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${variant === "success" ? "bg-emerald-400" : variant === "warning" ? "bg-yellow-400" : "bg-red-400"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Users size={12} className="text-white/30" />
                          <span className="text-xs font-medium text-white/60">{classroom.capacity}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {classroom.hasLab
                          ? <StatusBadge variant="purple"><Monitor size={9} />Lab</StatusBadge>
                          : <StatusBadge variant="info"><DoorOpen size={9} />Sınıf</StatusBadge>}
                        {classroom.hasProjector && (
                          <StatusBadge variant="warning">Projektör</StatusBadge>
                        )}
                      </div>
                      {user && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditClassroom(classroom); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(classroom.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>

          {!loading && !error && (
            <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-white/25">{classrooms.length} derslik listeleniyor</span>
              <span className="text-xs text-white/25">Ortalama kapasite: {Math.round(totalCapacity / (classrooms.length || 1))} kişi</span>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ClassroomModal
          classroom={editClassroom}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditClassroom(null); }}
        />
      )}
    </div>
  );
}
