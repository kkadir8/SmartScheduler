"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  DoorOpen,
  Activity,
  CheckCircle2,
  Circle,
  Clock,
  GitCommit,
  Layers,
  Cpu,
  Database,
  Globe,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import ApiError from "../components/ApiError";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const teamMembers = [
  { name: "Abdulkadir Gedik", role: "Product Owner", initials: "AG", color: "bg-blue-600" },
  { name: "Yunus Emre Edizer", role: "Scrum Master", initials: "YE", color: "bg-emerald-600" },
  { name: "Emin Akif Erzurumlu", role: "Frontend Lead", initials: "EA", color: "bg-purple-600" },
  { name: "Hamza Hakverir", role: "Database & DAL", initials: "HH", color: "bg-orange-600" },
  { name: "Burak Kürkçü", role: "DevOps & Test", initials: "BK", color: "bg-rose-600" },
];

const sprintTasks = [
  { text: "Proje kurulumu & repo yapısı", done: true },
  { text: "ASP.NET Core API scaffolding", done: true },
  { text: "In-memory veri katmanı", done: true },
  { text: "CORS & Swagger entegrasyonu", done: true },
  { text: "Next.js 14 frontend kurulumu", done: true },
  { text: "Dashboard UI geliştirme", done: true },
  { text: "API entegrasyonu (frontend)", done: true },
  { text: "PostgreSQL şema tasarımı", done: true },
  { text: "Entity Framework Core setup", done: true },
  { text: "Unit test altyapısı", done: true },
];

const activities = [
  {
    icon: GitCommit,
    text: "Backend API endpoint'leri tamamlandı",
    time: "2 saat önce",
    color: "text-emerald-400",
  },
  {
    icon: Layers,
    text: "Frontend dashboard redesign başladı",
    time: "4 saat önce",
    color: "text-purple-400",
  },
  {
    icon: Database,
    text: "In-memory data layer implement edildi",
    time: "1 gün önce",
    color: "text-blue-400",
  },
  {
    icon: Globe,
    text: "CORS politikası yapılandırıldı",
    time: "1 gün önce",
    color: "text-yellow-400",
  },
  {
    icon: Cpu,
    text: "Trello sprint board hazırlandı",
    time: "2 gün önce",
    color: "text-accent",
  },
];

const techStack = [
  "Next.js 14",
  "TypeScript",
  "Tailwind CSS",
  "ASP.NET Core 9",
  "C#",
  "PostgreSQL",
  "Entity Framework",
  "Genetik Algoritma",
];

interface Metrics {
  courses: number;
  instructors: number;
  classrooms: number;
  apiOk: boolean;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(false);
    try {
      const [coursesRes, instructorsRes, classroomsRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/courses`),
        fetch(`${API_BASE}/api/instructors`),
        fetch(`${API_BASE}/api/classrooms`),
        fetch(`${API_BASE}/api/health`),
      ]);
      const [courses, instructors, classrooms] = await Promise.all([
        coursesRes.json(),
        instructorsRes.json(),
        classroomsRes.json(),
      ]);
      setMetrics({
        courses: courses.length,
        instructors: instructors.length,
        classrooms: classrooms.length,
        apiOk: healthRes.ok,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const completedTasks = sprintTasks.filter((t) => t.done).length;
  const progressPct = Math.round((completedTasks / sprintTasks.length) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Genel Bakış</h2>
        <p className="text-sm text-white/40 mt-0.5">
          Sprint 1 — Yazılım Projesi Geliştirme 2025-2026 Bahar
        </p>
      </div>

      {/* Metric cards */}
      {error ? (
        <ApiError onRetry={fetchMetrics} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={BookOpen}
            label="Toplam Ders"
            value={loading ? "—" : metrics?.courses ?? 0}
            sub="Aktif ders kataloğu"
            color="blue"
            loading={loading}
          />
          <MetricCard
            icon={Users}
            label="Hocalar"
            value={loading ? "—" : metrics?.instructors ?? 0}
            sub="Öğretim görevlisi"
            color="purple"
            loading={loading}
          />
          <MetricCard
            icon={DoorOpen}
            label="Sınıflar"
            value={loading ? "—" : metrics?.classrooms ?? 0}
            sub="Derslik kapasitesi"
            color="emerald"
            loading={loading}
          />
          <MetricCard
            icon={Activity}
            label="API Durumu"
            value={loading ? "—" : metrics?.apiOk ? "Online" : "Offline"}
            sub="localhost:5000"
            color="accent"
            loading={loading}
          />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint progress */}
        <div className="lg:col-span-2 bg-cardbg border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Sprint 1 Durumu</h3>
              <p className="text-xs text-white/40 mt-0.5">
                {completedTasks}/{sprintTasks.length} görev tamamlandı
              </p>
            </div>
            <StatusBadge variant="info">Aktif</StatusBadge>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-5">
            <div
              className="progress-bar h-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Task list */}
          <div className="space-y-2.5">
            {sprintTasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3">
                {task.done ? (
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle size={15} className="text-white/20 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    task.done ? "text-white/60 line-through" : "text-white/80"
                  }`}
                >
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team panel */}
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">DevArchitechs Ekibi</h3>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${member.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                >
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">{member.name}</div>
                  <div className="text-[11px] text-white/40">{member.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tech stack */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <h4 className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wider">
              Teknoloji Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] font-medium bg-primary/30 border border-primary/40 text-blue-300 px-2 py-0.5 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Son Aktiviteler</h3>
          <StatusBadge variant="success">Live</StatusBadge>
        </div>
        <div className="space-y-3">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={13} className={activity.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">{activity.text}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock size={11} className="text-white/25" />
                  <span className="text-[11px] text-white/30">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
