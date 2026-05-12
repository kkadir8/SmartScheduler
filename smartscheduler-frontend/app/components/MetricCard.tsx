"use client";

import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "accent" | "emerald" | "purple";
  loading?: boolean;
}

const colorMap = {
  blue: {
    icon: "text-blue-400",
    iconBg: "bg-blue-500/10",
    glow: "hover:shadow-blue-500/10",
    bar: "bg-blue-400",
  },
  accent: {
    icon: "text-accent",
    iconBg: "bg-accent/10",
    glow: "hover:shadow-accent/10",
    bar: "bg-accent",
  },
  emerald: {
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    glow: "hover:shadow-emerald-500/10",
    bar: "bg-emerald-400",
  },
  purple: {
    icon: "text-purple-400",
    iconBg: "bg-purple-500/10",
    glow: "hover:shadow-purple-500/10",
    bar: "bg-purple-400",
  },
};

export default function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
  loading = false,
}: MetricCardProps) {
  const c = colorMap[color];

  if (loading) {
    return (
      <div className="bg-cardbg border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-16 h-4 rounded skeleton" />
        </div>
        <div className="w-20 h-8 rounded skeleton mb-2" />
        <div className="w-24 h-3 rounded skeleton" />
      </div>
    );
  }

  return (
    <div
      className={`bg-cardbg border border-white/[0.06] rounded-2xl p-5 card-hover hover:shadow-xl ${c.glow} animate-fadeIn`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        <div className={`w-1 h-1 rounded-full ${c.bar} mt-2`} />
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm font-medium text-white/60">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}
