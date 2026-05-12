"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

interface Instructor {
  id?: number;
  name: string;
  title: string;
  department: string;
  email: string;
}

interface Props {
  instructor?: Instructor | null;
  onSave: (instructor: Instructor) => Promise<void>;
  onClose: () => void;
}

const TITLES = ["Dr.", "Prof. Dr.", "Doç. Dr.", "Arş. Gör.", "Öğr. Gör."];

export default function InstructorModal({ instructor, onSave, onClose }: Props) {
  const [form, setForm] = useState<Instructor>({ name: "", title: "Dr.", department: "", email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (instructor) setForm(instructor);
  }, [instructor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  const fields = [
    { key: "name", label: "Ad Soyad", type: "text", placeholder: "Ahmet Yılmaz" },
    { key: "department", label: "Bölüm", type: "text", placeholder: "Bilgisayar Mühendisliği" },
    { key: "email", label: "E-posta", type: "email", placeholder: "ahmet@universite.edu.tr" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">
            {instructor?.id ? "Hoca Düzenle" : "Yeni Hoca Ekle"}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Unvan</label>
            <select value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all">
              {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-white/50 mb-1.5">{label}</label>
              <input type={type} value={form[key as keyof Instructor] as string}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required placeholder={placeholder}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
            </div>
          ))}

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
