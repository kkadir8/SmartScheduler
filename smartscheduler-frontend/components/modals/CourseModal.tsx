"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import type { Course, Instructor } from "@/types";

type CourseForm = Omit<Course, "instructorName">;

interface Props {
  course?: CourseForm | null;
  instructors: Pick<Instructor, "id" | "name">[];
  onSave: (course: CourseForm) => Promise<void>;
  onClose: () => void;
}

export default function CourseModal({ course, instructors, onSave, onClose }: Props) {
  const [form, setForm] = useState<CourseForm>({
    code: "", name: "", credit: 3, studentCount: 30, instructorId: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (course) setForm(course);
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">
            {course?.id ? "Ders Düzenle" : "Yeni Ders Ekle"}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Ders Kodu</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                required placeholder="BIL101"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Kredi</label>
              <input type="number" min={1} max={6} value={form.credit}
                onChange={e => setForm({ ...form, credit: +e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Ders Adı</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              required placeholder="Programlamaya Giriş"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Öğrenci Sayısı</label>
            <input type="number" min={1} value={form.studentCount}
              onChange={e => setForm({ ...form, studentCount: +e.target.value })}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Öğretim Görevlisi</label>
            <select value={form.instructorId} onChange={e => setForm({ ...form, instructorId: +e.target.value })}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all">
              <option value={0}>Seçiniz</option>
              {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 font-medium py-2.5 rounded-xl transition-all text-sm">
              İptal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={14} />Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
