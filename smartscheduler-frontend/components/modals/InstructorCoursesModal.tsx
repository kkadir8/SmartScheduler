"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, BookOpen, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Course, Instructor } from "@/types";

interface Props {
  instructor: Pick<Instructor, "id" | "name" | "title">;
  allCourses: Course[];
  onClose: () => void;
  onSaved: () => void;
}

export default function InstructorCoursesModal({ instructor, allCourses, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await apiFetch<number[]>(`/api/instructors/${instructor.id}/courses`);
      setSelectedIds(new Set(data ?? []));
      setLoading(false);
    };
    load();
  }, [instructor.id]);

  const toggle = (courseId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const { error: err } = await apiFetch(`/api/instructors/${instructor.id}/courses`, {
      method: "PUT",
      token: user?.token,
      body: JSON.stringify(Array.from(selectedIds)),
    });
    if (err) {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
    } else {
      setSaved(true);
      onSaved();
    }
    setSaving(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
    >
      <div
        className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white">Ders Ataması</h3>
            <p className="text-xs text-white/40 mt-0.5">{instructor.title} {instructor.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-3 py-1 rounded-lg">
                <BookOpen size={12} className="text-accent" />
                <span className="text-xs text-accent font-medium">{selectedIds.size} ders</span>
              </div>
            )}
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : allCourses.length === 0 ? (
            <div className="text-center text-white/30 text-sm py-10">Henüz ders eklenmemiş.</div>
          ) : (
            allCourses.map((course) => {
              const checked = selectedIds.has(course.id);
              const assignedElsewhere =
                !checked &&
                course.instructorId !== 0 &&
                course.instructorId !== instructor.id;

              return (
                <label
                  key={course.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    checked
                      ? "bg-accent/10 border-accent/25"
                      : "border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(course.id)}
                    className="accent-accent w-4 h-4 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight">
                      <span className="text-accent font-semibold">{course.code}</span>
                      <span className="text-white/70 ml-2">{course.name}</span>
                    </div>
                    <div className="text-xs text-white/35 mt-0.5">
                      {course.studentCount} öğrenci · {course.durationHours} saat/hafta
                    </div>
                  </div>
                  {assignedElsewhere && (
                    <div className="flex items-center gap-1 text-amber-400/70 flex-shrink-0">
                      <AlertCircle size={11} />
                      <span className="text-[10px] truncate max-w-[80px]">
                        {course.instructorName ?? "Atanmış"}
                      </span>
                    </div>
                  )}
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex-shrink-0 border-t border-white/[0.06] pt-4">
          {error && (
            <div className="mb-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 font-medium py-2.5 rounded-xl transition-all text-sm"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <>✓ Kaydedildi</>
              ) : (
                <><Save size={14} />Kaydet</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
