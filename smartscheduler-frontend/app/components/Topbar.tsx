"use client";

import { usePathname } from "next/navigation";
import { Bell, GitBranch, Zap } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Proje genel bakışı" },
  "/courses": { title: "Dersler", subtitle: "Ders kataloğu ve detayları" },
  "/instructors": { title: "Hocalar", subtitle: "Öğretim görevlileri" },
  "/classrooms": { title: "Sınıflar", subtitle: "Derslik ve kapasite bilgileri" },
  "/schedule": { title: "Program Oluştur", subtitle: "AI destekli otomatik program oluşturucu" },
};

export default function Topbar() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: "SmartScheduler", subtitle: "" };

  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 bg-darkbg/60 backdrop-blur-sm sticky top-0 z-30">
      {/* Left — page title */}
      <div>
        <h1 className="text-sm font-semibold text-white leading-tight">{page.title}</h1>
        {page.subtitle && (
          <p className="text-[11px] text-white/35 leading-tight">{page.subtitle}</p>
        )}
      </div>

      {/* Right — badges + actions */}
      <div className="flex items-center gap-3">
        {/* API status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse2" />
          <span className="text-[11px] text-white/50 font-medium">API Online</span>
        </div>

        {/* Sprint badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
          <Zap size={10} className="text-accent" />
          <span className="text-[11px] text-accent font-semibold">Sprint 1</span>
        </div>

        {/* Repo link */}
        <a
          href="https://github.com/kkadir8/DevArchitechs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full hover:bg-white/[0.08] transition-colors"
        >
          <GitBranch size={11} className="text-white/40" />
          <span className="text-[11px] text-white/50 font-medium">DevArchitechs</span>
        </a>

        {/* Notification bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
          <Bell size={15} className="text-white/50" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-primary border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/70">
          DA
        </div>
      </div>
    </header>
  );
}
