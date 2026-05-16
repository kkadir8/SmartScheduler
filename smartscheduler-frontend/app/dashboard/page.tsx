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
  { text: "JWT Authentication & BCrypt şifreleme", done: true },
  { text: "Repository Pattern & Unit of Work", done: true },
  { text: "CRUD API endpoint'leri (POST/PUT/DELETE)", done: true },
  { text: "Login / Register sayfaları", done: true },
  { text: "Admin CRUD modal'ları (Dersler, Hocalar, Sınıflar)", done: true },
  { text: "AuthContext & JWT token yönetimi", done: true },
  { text: "Genetik algoritma servisi (crossover, mutation)", done: true },
  { text: "Program oluşturma endpoint'i", done: true },
  { text: "GitHub Actions CI/CD pipeline", done: true },
  { text: "Docker multi-container build", done: true },
];

const activities = [
  {
    icon: Cpu,
    text: "Genetik algoritma servisi tamamlandı — crossover, mutation, fitness",
    time: "2 saat önce",
    color: "text-emerald-400",
  },
  {
    icon: Layers,
    text: "Login/Register sayfaları & CRUD modal'ları eklendi",
    time: "3 saat önce",
    color: "text-purple-400",
  },
  {
    icon: GitCommit,
    text: "JWT Auth middleware & BCrypt entegrasyonu tamamlandı",
    time: "5 saat önce",
    color: "text-blue-400",
  },
  {
    icon: Database,
    text: "Repository Pattern & Unit of Work implementasyonu",
    time: "6 saat önce",
    color: "text-yellow-400",
  },
  {
    icon: Globe,
    text: "GitHub Actions CI/CD pipeline kuruldu",
    time: "1 gün önce",
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
          Sprint 2 — Yazılım Projesi Geliştirme 2025-2026 Bahar
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
              <h3 className="text-sm font-semibold text-white">Sprint 2 Durumu</h3>
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
