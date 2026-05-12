"use client";

import { useEffect, useState } from "react";
import { Mail, BookOpen, Users } from "lucide-react";
import ApiError from "../components/ApiError";

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
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
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
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInstructors = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE}/api/instructors`);
      const data = await res.json();
      setInstructors(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Öğretim Görevlileri</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {loading ? "Yükleniyor..." : `${instructors.length} hoca kayıtlı`}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-xl">
          <Users size={14} className="text-white/30" />
          <span className="text-xs text-white/40">{loading ? "—" : instructors.length} üye</span>
        </div>
      </div>

      {error ? (
        <ApiError onRetry={fetchInstructors} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : instructors.map((instructor, idx) => (
                <div
                  key={instructor.id}
                  className="bg-cardbg border border-white/[0.06] rounded-2xl p-5 card-hover hover:shadow-xl hover:shadow-purple-500/5 hover:border-white/[0.10] group animate-fadeIn"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Avatar + name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-lg font-bold text-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {getInitials(instructor.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white leading-tight truncate">
                        {instructor.name}
                      </div>
                      <div className="text-xs text-accent mt-0.5 font-medium">{instructor.title}</div>
                      <div className="text-[11px] text-white/40 mt-0.5 truncate">
                        {instructor.department}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.04] mb-3" />

                  {/* Contact info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-white/25 flex-shrink-0" />
                      <span className="text-[11px] text-white/40 truncate">{instructor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-white/25 flex-shrink-0" />
                      <span className="text-[11px] text-white/40">
                        {instructor.courseCount ?? "—"} ders verilen
                      </span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
