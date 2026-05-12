"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

interface Classroom {
  id?: number;
  name: string;
  building: string;
  capacity: number;
  hasLab: boolean;
  hasProjector: boolean;
}

interface Props {
  classroom?: Classroom | null;
  onSave: (classroom: Classroom) => Promise<void>;
  onClose: () => void;
}

export default function ClassroomModal({ classroom, onSave, onClose }: Props) {
  const [form, setForm] = useState<Classroom>({
    name: "", building: "", capacity: 30, hasLab: false, hasProjector: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classroom) setForm(classroom);
  }, [classroom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">
            {classroom?.id ? "Derslik Düzenle" : "Yeni Derslik Ekle"}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Derslik Adı</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                required placeholder="A101"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Kapasite</label>
              <input type="number" min={1} value={form.capacity}
                onChange={e => setForm({ ...form, capacity: +e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Bina</label>
            <input value={form.building} onChange={e => setForm({ ...form, building: e.target.value })}
              required placeholder="Mühendislik Binası"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
          </div>

          <div className="flex gap-4">
            {[
              { key: "hasLab", label: "Laboratuvar" },
              { key: "hasProjector", label: "Projektör" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof Classroom] as boolean}
                  onChange={e => setForm({ ...form, [key]: e.target.checked })}
                  className="w-4 h-4 accent-accent rounded" />
                <span className="text-sm text-white/60">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 font-medium py-2.5 rounded-xl transition-all text-sm">İptal</button>
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
