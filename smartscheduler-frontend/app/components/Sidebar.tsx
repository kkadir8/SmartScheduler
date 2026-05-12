"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DoorOpen,
  CalendarCog,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    badge: null,
  },
  {
    href: "/courses",
    icon: BookOpen,
    label: "Dersler",
    badge: null,
  },
  {
    href: "/instructors",
    icon: Users,
    label: "Hocalar",
    badge: null,
  },
  {
    href: "/classrooms",
    icon: DoorOpen,
    label: "Sınıflar",
    badge: null,
  },
  {
    href: "/schedule",
    icon: CalendarCog,
    label: "Program Oluştur",
    badge: "S3",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`glass-sidebar border-r border-white/[0.06] flex flex-col transition-all duration-300 ease-in-out relative z-40 ${
        collapsed ? "w-[68px]" : "w-[220px]"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="flex-shrink-0 w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/30">
          <GraduationCap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fadeIn overflow-hidden">
            <div className="font-bold text-sm text-white leading-tight">SmartScheduler</div>
            <div className="text-[10px] text-white/40 leading-tight">DevArchitechs</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-active flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-white/50 hover:text-white/90 hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? "text-accent" : "text-white/40 group-hover:text-white/70"
                }`}
              />
              {!collapsed && (
                <span className="animate-fadeIn flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[10px] font-semibold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sprint Badge */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-primary/40 border border-white/[0.06] animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-accent" />
            <span className="text-[11px] font-semibold text-white/70">Sprint 1 Aktif</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="progress-bar h-full" style={{ width: "100%" }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-white/30">İlerleme</span>
            <span className="text-[10px] text-accent font-medium">100%</span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-cardbg border border-white/[0.08] rounded-full flex items-center justify-center hover:bg-primary transition-colors shadow-lg z-50"
        aria-label={collapsed ? "Sidebar'ı genişlet" : "Sidebar'ı daralt"}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-white/50" />
        ) : (
          <ChevronLeft size={12} className="text-white/50" />
        )}
      </button>
    </aside>
  );
}
