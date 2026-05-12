"use client";

import { useState, useEffect } from "react";
import {
  CalendarCog,
  Dna,
  Cpu,
  Zap,
  Shield,
  BarChart3,
  FileDown,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const features = [
  {
    icon: Dna,
    title: "Genetik Algoritma Motoru",
    desc: "Binlerce olası program kombinasyonunu evrimsel optimizasyon ile değerlendirir ve en uygun sonucu üretir.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Shield,
    title: "Otomatik Kısıt Yönetimi",
    desc: "Hoca müsaitliği, sınıf kapasitesi, ders çakışmaları ve bölüm gereksinimleri otomatik olarak yönetilir.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: BarChart3,
    title: "What-If Analizi",
    desc: "Farklı kısıt senaryolarını anında test edin ve sonuçları karşılaştırın.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: FileDown,
    title: "PDF / Excel Export",
    desc: "Oluşturulan programı öğretim görevlisi ve sınıf bazlı görünümlerde PDF veya Excel olarak indirin.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
];

const timeline = [
  { sprint: "Sprint 1", label: "API & Kurulum", done: true },
  { sprint: "Sprint 2", label: "Veritabanı & CRUD", done: false, current: false },
  { sprint: "Sprint 3", label: "Program Oluşturucu", done: false, current: true },
  { sprint: "Sprint 4", label: "Test & Optimizasyon", done: false, current: false },
];

function GeneticAnimation() {
  const [gen, setGen] = useState(1);
  const [fitness, setFitness] = useState(42);
  const [nodes, setNodes] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 300,
      y: Math.random() * 120,
      active: Math.random() > 0.5,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setGen((g) => (g % 99) + 1);
      setFitness((f) => Math.min(99, f + Math.floor(Math.random() * 3)));
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          active: Math.random() > 0.4,
          x: Math.max(0, Math.min(300, n.x + (Math.random() - 0.5) * 20)),
          y: Math.max(0, Math.min(120, n.y + (Math.random() - 0.5) * 10)),
        }))
      );
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-darkbg border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-accent" />
          <span className="text-xs font-semibold text-white/60">Genetik Algoritma Simülasyonu</span>
        </div>
        <StatusBadge variant="warning">Sprint 3'te gelecek</StatusBadge>
      </div>

      {/* SVG animation */}
      <div className="relative h-32 mb-4">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 320 130"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connections */}
          {nodes.map((n, i) =>
            nodes.slice(i + 1, i + 3).map((n2) => (
              <line
                key={`${n.id}-${n2.id}`}
                x1={n.x + 10}
                y1={n.y + 10}
                x2={n2.x + 10}
                y2={n2.y + 10}
                stroke={n.active && n2.active ? "rgba(232,89,60,0.3)" : "rgba(255,255,255,0.04)"}
                strokeWidth={1}
                className="transition-all duration-700"
              />
            ))
          )}
          {/* Nodes */}
          {nodes.map((n) => (
            <g key={n.id} className="transition-all duration-700">
              <circle
                cx={n.x + 10}
                cy={n.y + 10}
                r={n.active ? 5 : 3}
                fill={n.active ? "#E8593C" : "#1E3A5F"}
                opacity={n.active ? 0.9 : 0.4}
              />
              {n.active && (
                <circle
                  cx={n.x + 10}
                  cy={n.y + 10}
                  r={8}
                  fill="none"
                  stroke="#E8593C"
                  strokeWidth={0.5}
                  opacity={0.3}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
          <div className="text-lg font-bold text-accent">{gen}</div>
          <div className="text-[10px] text-white/35">Nesil</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
          <div className="text-lg font-bold text-emerald-400">{fitness}%</div>
          <div className="text-[10px] text-white/35">Uygunluk</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
          <div className="text-lg font-bold text-blue-400">50</div>
          <div className="text-[10px] text-white/35">Populasyon</div>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <CalendarCog size={22} className="text-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Program Oluşturucu</h2>
            <StatusBadge variant="warning">Sprint 3</StatusBadge>
          </div>
          <p className="text-sm text-white/40">
            AI destekli genetik algoritma ile otomatik ders programı oluşturma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: coming soon card */}
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[320px]">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
            <Lock size={32} className="text-accent/60" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Sprint 3'te Geliyor</h3>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
            Genetik algoritma tabanlı program oluşturucu, Sprint 3 kapsamında geliştirilecektir.
            Şu an geliştirme aşamasındayız.
          </p>

          {/* Progress timeline */}
          <div className="flex items-center gap-2 w-full max-w-xs">
            {timeline.map((item, i) => (
              <div key={item.sprint} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-1 rounded-full ${
                    item.done
                      ? "bg-accent"
                      : item.current
                      ? "bg-accent/40"
                      : "bg-white/[0.06]"
                  }`}
                />
                <span
                  className={`text-[9px] font-medium text-center leading-tight ${
                    item.done
                      ? "text-accent"
                      : item.current
                      ? "text-white/50"
                      : "text-white/20"
                  }`}
                >
                  {item.sprint}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: genetic animation */}
        <GeneticAnimation />
      </div>

      {/* Features preview */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-accent" />
          <h3 className="text-sm font-semibold text-white">Planlanan Özellikler</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`bg-cardbg border ${feature.border} rounded-2xl p-5 card-hover animate-fadeIn`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={18} className={feature.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification signup */}
      <div className="bg-gradient-to-r from-primary/60 to-accent/10 border border-accent/15 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-accent flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-white">Sprint 3 başladığında haberdar ol</div>
            <div className="text-xs text-white/40">Tahmini başlangıç: Mayıs 2026</div>
          </div>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent/60 text-sm font-medium px-4 py-2 rounded-xl cursor-not-allowed"
        >
          Bildirim Al
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
