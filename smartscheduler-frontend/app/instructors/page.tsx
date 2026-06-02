"use client";

import { useEffect, useState } from "react";
import { Mail, BookOpen, Users, Plus, Pencil, Trash2, Calendar, Download } from "lucide-react";
import ApiError from "../components/ApiError";
import InstructorModal from "../components/modals/InstructorModal";
import AvailabilityModal from "../components/modals/AvailabilityModal";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Instructor {
  id: number;
  name: string;
  title: string;
  department: string;
  email: string;
  courseCount?: number;
}

const avatarColors = [
  "from-blue-600 to-blue-400",
  "from-purple-600 to-purple-400",
  "from-emerald-600 to-emerald-400",
  "from-orange-600 to-orange-400",
  "from-rose-600 to-rose-400",
  "from-cyan-600 to-cyan-400",
];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function SkeletonCard() {
  return (
    <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded skeleton" />
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-3 w-28 rounded skeleton" />
        </div>
      </div>
      <div className="h-px bg-white/[0.04] mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-3/4 rounded skeleton" />
      </div>
    </div>
  );
}

export default function InstructorsPage() {
  const { user, logout } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editInstructor, setEditInstructor] = useState<Instructor | null>(null);
  const [availabilityTarget, setAvailabilityTarget] = useState<Instructor | null>(null);

  const api = <T,>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, token: user?.token, onUnauthorized: logout });

  const fetchInstructors = async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await api<Instructor[]>("/api/instructors");
    if (err) { setError(true); } else { setInstructors(data ?? []); }
    setLoading(false);
  };

  useEffect(() => { fetchInstructors(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (instructor: { id?: number; name: string; title: string; department: string; email: string }) => {
    const method = instructor.id ? "PUT" : "POST";
    const endpoint = instructor.id ? `/api/instructors/${instructor.id}` : "/api/instructors";
    const { error: err } = await api(endpoint, { method, body: JSON.stringify(instructor) });
    if (err) throw new Error(err);
    setShowModal(false);
    setEditInstructor(null);
    fetchInstructors();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu hocayı silmek istediğinizden emin misiniz?")) return;
    setDeleteError("");
    const { error: err } = await api(`/api/instructors/${id}`, { method: "DELETE" });
    if (err) { setDeleteError(err); return; }
    fetchInstructors();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Öğretim Görevlileri</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {loading ? "Yükleniyor..." : `${instructors.length} hoca kayıtlı`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-xl">
            <Users size={14} className="text-white/30" />
            <span className="text-xs text-white/40">{loading ? "—" : instructors.length} üye</span>
          </div>
          <button
            onClick={() => window.open(`${API_BASE}/api/export/instructors/excel`, '_blank')}
            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-2 rounded-xl border border-emerald-500/30 transition-colors"
          >
            <Download size={15} />
            Excel
          </button>
          {user && (
            <button onClick={() => { setEditInstructor(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <Plus size={15} />
              Yeni Hoca
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
        <ApiError onRetry={fetchInstructors} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : instructors.map((instructor, idx) => (
                <div key={instructor.id}
                  className="bg-cardbg border border-white/[0.06] rounded-2xl p-5 card-hover hover:shadow-xl hover:shadow-purple-500/5 hover:border-white/[0.10] group animate-fadeIn relative flex flex-col"
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  {user && (
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditInstructor(instructor); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(instructor.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-lg font-bold text-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      {getInitials(instructor.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white leading-tight truncate">{instructor.name}</div>
                      <div className="text-xs text-accent mt-0.5 font-medium">{instructor.title}</div>
                      <div className="text-[11px] text-white/40 mt-0.5 truncate">{instructor.department}</div>
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.04] mb-3" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-white/25 flex-shrink-0" />
                      <span className="text-[11px] text-white/40 truncate">{instructor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-white/25 flex-shrink-0" />
                      <span className="text-[11px] text-white/40">{instructor.courseCount ?? "—"} ders verilen</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAvailabilityTarget(instructor)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-accent/10 border border-white/[0.06] hover:border-accent/30 text-white/40 hover:text-accent text-xs font-medium py-2 rounded-xl transition-all"
                  >
                    <Calendar size={12} />
                    Müsaitlik Ayarla
                  </button>
                </div>
              ))}
        </div>
      )}

      {showModal && (
        <InstructorModal
          instructor={editInstructor}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditInstructor(null); }}
        />
      )}

      {availabilityTarget && (
        <AvailabilityModal
          instructor={availabilityTarget}
          onClose={() => setAvailabilityTarget(null)}
        />
      )}
    </div>
  );
}
