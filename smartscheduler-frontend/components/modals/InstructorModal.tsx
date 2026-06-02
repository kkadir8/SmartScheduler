"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Save, ChevronDown, Check } from "lucide-react";
import type { Instructor } from "@/types";

type InstructorForm = Omit<Instructor, "id" | "courseCount">;
type InstructorPayload = InstructorForm & { id?: number };

interface Props {
  instructor?: InstructorPayload | null;
  onSave: (instructor: InstructorPayload) => Promise<void>;
  onClose: () => void;
}

const TITLES = ["Dr.", "Prof. Dr.", "Doç. Dr.", "Arş. Gör.", "Öğr. Gör."];

function CustomSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all flex items-center justify-between"
      >
        <span>{value}</span>
        <ChevronDown size={14} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e2e] border border-white/[0.10] rounded-xl overflow-hidden shadow-xl" style={{ zIndex: 10001 }}>
          {TITLES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { onChange(t); setOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-left flex items-center justify-between hover:bg-white/[0.06] transition-colors"
            >
              <span className={value === t ? "text-accent" : "text-white/70"}>{t}</span>
              {value === t && <Check size={13} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InstructorModal({ instructor, onSave, onClose }: Props) {
  const [form, setForm] = useState<InstructorForm>({ name: "", title: "Dr.", department: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (instructor) setForm(instructor); }, [instructor]);

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

  const fields = [
    { key: "name", label: "Ad Soyad", type: "text", placeholder: "Ahmet Yılmaz" },
    { key: "department", label: "Bölüm", type: "text", placeholder: "Bilgisayar Mühendisliği" },
    { key: "email", label: "E-posta", type: "email", placeholder: "ahmet@universite.edu.tr" },
  ];

  if (!mounted) return null;

  return createPortal(
    <div
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
    >
      <div className="bg-cardbg border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">
            {instructor?.id ? "Hoca Düzenle" : "Yeni Hoca Ekle"}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Unvan</label>
            <CustomSelect value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          </div>

          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-white/50 mb-1.5">{label}</label>
              <input type={type} value={form[key as keyof InstructorForm] as string}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required placeholder={placeholder}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all" />
            </div>
          ))}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}

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
    </div>,
    document.body
  );
}
