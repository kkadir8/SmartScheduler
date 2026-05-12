"use client";

import { useEffect, useState } from "react";
import { Search, Plus, BookOpen, ChevronUp, ChevronDown } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ApiError from "../components/ApiError";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Course {
  id: number;
  code: string;
  name: string;
  credit: number;
  instructorName: string;
  studentCount: number;
}

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Course>("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchCourses = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE}/api/courses`);
      const data = await res.json();
      setCourses(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
        <button
          disabled
          title="Sprint 2'de aktif olacak"
          className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent/40 text-sm font-medium px-4 py-2 rounded-xl cursor-not-allowed"
        >
          <Plus size={15} />
          Yeni Ders
        </button>
      </div>

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
                    <tr
                      key={course.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
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
                            <div
                              className="h-full bg-blue-400/50 rounded-full"
                              style={{ width: `${Math.min((course.studentCount / 60) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
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
    </div>
  );
}
