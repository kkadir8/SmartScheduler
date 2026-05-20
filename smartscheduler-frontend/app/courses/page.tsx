"use client";

import { useEffect, useState } from "react";
import { Search, Plus, BookOpen, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ApiError from "../components/ApiError";
import CourseModal from "../components/modals/CourseModal";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../lib/api";

interface Course {
  id: number;
  code: string;
  name: string;
  credit: number;
  instructorName: string;
  instructorId: number;
  studentCount: number;
}

interface Instructor { id: number; name: string; }

function creditVariant(credit: number): "success" | "info" | "purple" | "warning" {
  if (credit <= 2) return "success";
  if (credit === 3) return "info";
  if (credit === 4) return "purple";
  return "warning";
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-4 rounded skeleton ${i === 1 ? "w-40" : "w-20"}`} />
        </td>
      ))}
    </tr>
  );
}

export default function CoursesPage() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Course>("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const api = <T,>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, token: user?.token, onUnauthorized: logout });

  const fetchCourses = async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await api<Course[]>("/api/courses");
    if (err) { setError(true); } else { setCourses(data ?? []); }
    setLoading(false);
  };

  const fetchInstructors = async () => {
    const { data } = await api<Instructor[]>("/api/instructors");
    if (data) setInstructors(data);
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (course: { id?: number; code: string; name: string; credit: number; studentCount: number; instructorId: number }) => {
    const method = course.id ? "PUT" : "POST";
    const endpoint = course.id ? `/api/courses/${course.id}` : "/api/courses";
    const { error: err } = await api(endpoint, { method, body: JSON.stringify(course) });
    if (err) throw new Error(err);
    setShowModal(false);
    setEditCourse(null);
    fetchCourses();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu dersi silmek istediğinizden emin misiniz?")) return;
    setDeleteError("");
    const { error: err } = await api(`/api/courses/${id}`, { method: "DELETE" });
    if (err) { setDeleteError(err); return; }
    fetchCourses();
  };

  const handleSort = (key: keyof Course) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = courses
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }: { col: keyof Course }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-white/20" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-accent" />
    ) : (
      <ChevronDown size={12} className="text-accent" />
    );
  };

  const columns: { key: keyof Course; label: string }[] = [
    { key: "code", label: "Kod" },
    { key: "name", label: "Ders Adı" },
    { key: "credit", label: "Kredi" },
    { key: "instructorName", label: "Hoca" },
    { key: "studentCount", label: "Öğrenci" },
  ];

  const modalCourseData = editCourse ? {
    id: editCourse.id,
    code: editCourse.code,
    name: editCourse.name,
    credit: editCourse.credit,
    studentCount: editCourse.studentCount,
    instructorId: editCourse.instructorId,
  } : null;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Ders Kataloğu</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {loading ? "Yükleniyor..." : `${filtered.length} ders listeleniyor`}
          </p>
        </div>
        {user && (
          <button
            onClick={() => { setEditCourse(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Yeni Ders
          </button>
        )}
      </div>

      {/* Delete error banner */}
      {deleteError && (
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
          <span className="text-xs text-rose-300">{deleteError}</span>
          <button onClick={() => setDeleteError("")} className="text-rose-300/50 hover:text-rose-300 ml-3 text-lg leading-none">×</button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Ders adı, kodu veya hoca ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-cardbg border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
        />
      </div>

      {error ? (
        <ApiError onRetry={fetchCourses} />
      ) : (
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors select-none"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        <SortIcon col={col.key} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <BookOpen size={32} className="text-white/10 mx-auto mb-3" />
                      <p className="text-sm text-white/30">Sonuç bulunamadı</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((course) => (
                    <tr key={course.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-md">
                          {course.code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium text-white/90">{course.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge variant={creditVariant(course.credit)}>
                          {course.credit} kredi
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-white/60">{course.instructorName}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/60">{course.studentCount}</span>
                          <div className="h-1.5 w-16 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400/50 rounded-full"
                              style={{ width: `${Math.min((course.studentCount / 60) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      {user && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditCourse(course); setShowModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(course.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && !error && (
            <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-white/25">
                Toplam {courses.length} ders
              </span>
              <span className="text-xs text-white/25">
                Arama: {filtered.length} sonuç
              </span>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <CourseModal
          course={modalCourseData}
          instructors={instructors}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditCourse(null); }}
        />
      )}
    </div>
  );
}
