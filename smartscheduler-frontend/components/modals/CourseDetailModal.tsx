"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, DoorOpen, BookOpen, Clock, Users } from "lucide-react";
import { DAYS } from "@/lib/constants";
import type { ScheduleEntry, Course, Instructor, Classroom } from "@/types";

const COLORS = [
  "text-blue-300",
  "text-purple-300",
  "text-emerald-300",
  "text-orange-300",
  "text-rose-300",
  "text-cyan-300",
  "text-violet-300",
];

interface Props {
  entry: ScheduleEntry;
  course?: Course;
  instructor?: Instructor;
  classroom?: Classroom;
  onClose: () => void;
}

export default function CourseDetailModal({ entry, course, instructor, classroom, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dayName = DAYS[entry.dayOfWeek] ?? `Gün ${entry.dayOfWeek}`;
  const endHour = entry.startHour + entry.durationHours;
  const accentColor = COLORS[entry.courseId % COLORS.length];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#141418] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`text-xs font-bold ${accentColor} tracking-wider mb-1`}>
              {course?.code ?? `#${entry.courseId}`}
            </div>
            <h3 className="text-base font-bold text-white leading-snug">
              {course?.name ?? "Ders Detayı"}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-white/40">
              <Clock size={11} />
              <span className="text-xs">
                {dayName} · {entry.startHour}:00 – {endHour}:00
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors mt-0.5 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Ders bilgileri */}
          <Section icon={BookOpen} title="Ders Bilgileri">
            <InfoRow label="Ders Kodu"   value={course?.code ?? "—"} />
            <InfoRow label="Kredi"        value={course?.credit != null ? `${course.credit} kredi` : "—"} />
            <InfoRow label="Haftalık Süre" value={`${entry.durationHours} saat`} />
            <InfoRow
              label="Öğrenci Sayısı"
              value={course?.studentCount != null ? `${course.studentCount} öğrenci` : "—"}
            />
          </Section>

          {/* Öğretim üyesi */}
          {(instructor || course?.instructorName) && (
            <Section icon={User} title="Öğretim Üyesi">
              <InfoRow
                label="Ad Soyad"
                value={instructor
                  ? `${instructor.title} ${instructor.name}`.trim()
                  : (course?.instructorName ?? "—")}
              />
              {instructor?.department && (
                <InfoRow label="Bölüm" value={instructor.department} />
              )}
              {instructor?.email && (
                <InfoRow label="E-posta" value={instructor.email} />
              )}
            </Section>
          )}

          {/* Derslik */}
          {classroom && (
            <Section icon={DoorOpen} title="Derslik">
              <InfoRow label="Salon"    value={classroom.name} />
              <InfoRow label="Bina"     value={classroom.building} />
              <InfoRow label="Kapasite" value={`${classroom.capacity} kişi`} />
              {(classroom.hasLab || classroom.hasProjector) && (
                <div className="flex gap-2 pt-1">
                  {classroom.hasLab && (
                    <Badge label="Laboratuvar" color="cyan" />
                  )}
                  {classroom.hasProjector && (
                    <Badge label="Projektör" color="purple" />
                  )}
                </div>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className="text-white/30" />
        <span className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">{title}</span>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 space-y-2.5">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-white/40 flex-shrink-0">{label}</span>
      <span className="text-xs text-white/80 font-medium text-right">{value}</span>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: "cyan" | "purple" }) {
  const cls =
    color === "cyan"
      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
      : "bg-purple-500/10 text-purple-400 border-purple-500/20";
  return (
    <span className={`text-[10px] border rounded-full px-2 py-0.5 ${cls}`}>
      {label}
    </span>
  );
}
