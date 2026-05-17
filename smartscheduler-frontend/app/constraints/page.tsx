"use client";

import { useEffect, useState } from "react";
import { Search, Plus, ShieldCheck, Trash2, BookOpen, Building2 } from "lucide-react";
import ApiError from "../components/ApiError";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Constraint {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  classroomId: number;
  classroomName: string;
  classroomBuilding?: string;
  notes?: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
}

interface Classroom {
  id: number;
  name: string;
  building?: string;
  capacity: number;
  hasLab: boolean;
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 4 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-4 rounded skeleton ${i === 1 ? "w-40" : "w-24"}`} />
        </td>
      ))}
    </tr>
  );
}

interface AddModalProps {
  courses: Course[];
  classrooms: Classroom[];
  token: string;
  onSaved: () => void;
  onClose: () => void;
}

function AddConstraintModal({ courses, classrooms, token, onSaved, onClose }: AddModalProps) {
  const [courseId, setCourseId] = useState<number | "">("");
  const [classroomId, setClassroomId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!courseId || !classroomId) {
      setError("Ders ve derslik seçimi zorunludur.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/constraints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, classroomId, notes: notes || null }),
      });
      if (res.status === 409) {
        setError("Bu ders-derslik kısıtı zaten mevcut.");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        setError(text || `Hata: ${res.status}`);
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-semibold text-white">Yeni Kısıt Ekle</h3>
            <p className="text-xs text-white/40 mt-0.5">Ders–derslik eşleştirmesi oluştur</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none">×</button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Ders seç */}
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Ders</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
            >
              <option value="">Ders seçin...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          {/* Derslik seç */}
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Derslik</label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
            >
              <option value="">Derslik seçin...</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.building ? ` (${c.building})` : ""} — {c.capacity} kişilik{c.hasLab ? " 🔬" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Not */}
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Not (isteğe bağlı)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kısıt için açıklama..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 font-medium py-2.5 rounded-xl transition-all text-sm"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Plus size={14} /> Ekle</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConstraintsPage() {
  const { user } = useAuth();
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(false);
    try {
      const [cRes, crRes, clRes] = await Promise.all([
        fetch(`${API_BASE}/api/constraints`),
        fetch(`${API_BASE}/api/courses`),
        fetch(`${API_BASE}/api/classrooms`),
      ]);
      setConstraints(await cRes.json());
      setCourses(await crRes.json());
      setClassrooms(await clRes.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kısıtı silmek istediğinizden emin misiniz?")) return;
    await fetch(`${API_BASE}/api/constraints/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    fetchAll();
  };

  const filtered = constraints.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      c.courseName.toLowerCase().includes(search.toLowerCase()) ||
      c.classroomName.toLowerCase().includes(search.toLowerCase()) ||
      (c.classroomBuilding ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Derslere göre gruplama
  const grouped = filtered.reduce<Record<string, Constraint[]>>((acc, c) => {
    const key = `${c.courseCode}|||${c.courseName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Kısıt Konfigürasyonu</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {loading ? "Yükleniyor..." : `${constraints.length} kısıt tanımlı`}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Kısıt Ekle
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-accent/5 border border-accent/15 rounded-xl px-4 py-3">
        <ShieldCheck size={15} className="text-accent flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          Bir derse kısıt eklendiğinde algoritma yalnızca izin verilen dersliklerden birini seçer.
          Kısıt tanımlanmamış dersler için algoritma uygun herhangi bir dersliği kullanabilir.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Ders kodu, adı veya derslik ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-cardbg border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
        />
      </div>

      {error ? (
        <ApiError onRetry={fetchAll} />
      ) : (
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Ders</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">İzin Verilen Derslikler</th>
                  {user && <th className="px-4 py-3 w-16" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : Object.keys(grouped).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-16">
                      <ShieldCheck size={32} className="text-white/10 mx-auto mb-3" />
                      <p className="text-sm text-white/30">Henüz kısıt tanımlanmamış</p>
                      <p className="text-xs text-white/20 mt-1">Algoritma tüm derslikler arasından seçim yapacak</p>
                    </td>
                  </tr>
                ) : (
                  Object.entries(grouped).map(([key, items]) => {
                    const [code, name] = key.split("|||");
                    return (
                      <tr key={key} className="hover:bg-white/[0.02] transition-colors group align-top">
                        {/* Ders */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <BookOpen size={13} className="text-white/25 flex-shrink-0" />
                            <div>
                              <span className="font-mono text-xs font-semibold bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-md">
                                {code}
                              </span>
                              <div className="text-xs text-white/50 mt-1">{name}</div>
                            </div>
                          </div>
                        </td>

                        {/* Derslikler */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 group/item"
                              >
                                <Building2 size={11} className="text-white/30 flex-shrink-0" />
                                <span className="text-xs text-white/70">{item.classroomName}</span>
                                {item.classroomBuilding && (
                                  <span className="text-[10px] text-white/30">({item.classroomBuilding})</span>
                                )}
                                {user && (
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="ml-1 text-white/20 hover:text-rose-400 transition-colors"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {items[0]?.notes && (
                            <p className="text-[11px] text-white/30 mt-1.5 italic">{items[0].notes}</p>
                          )}
                        </td>

                        {user && <td />}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && !error && (
            <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-white/25">Toplam {constraints.length} kısıt</span>
              <span className="text-xs text-white/25">{Object.keys(grouped).length} ders kısıtlanmış</span>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <AddConstraintModal
          courses={courses}
          classrooms={classrooms}
          token={user?.token ?? ""}
          onSaved={fetchAll}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
