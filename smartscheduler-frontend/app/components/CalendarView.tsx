"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const ENTRY_COLORS = [
  { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-300" },
  { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-300" },
  { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300" },
  { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-300" },
  { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300" },
  { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-300" },
  { bg: "bg-accent/20", border: "border-accent/40", text: "text-accent" },
];

function getColor(idx: number) {
  return ENTRY_COLORS[idx % ENTRY_COLORS.length];
}

export interface ScheduleEntry {
  id: number;
  courseId: number;
  classroomId: number;
  dayOfWeek: number;
  startHour: number;
  durationHours: number;
  course?: { name: string; code: string };
  classroom?: { name: string };
  instructor?: { name: string };
}

export default function CalendarView({ entries }: { entries: ScheduleEntry[] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const getMonday = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff + offset * 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const monday = getMonday(weekOffset);
  const weekLabel = (() => {
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return `${monday.getDate()} ${monday.toLocaleString("tr-TR", { month: "short" })} – ${friday.getDate()} ${friday.toLocaleString("tr-TR", { month: "short", year: "numeric" })}`;
  })();

  const entryMap: Record<number, Record<number, { entry: ScheduleEntry; colorIdx: number }[]>> = {};
  const courseColorMap: Record<number, number> = {};
  let colorCounter = 0;

  entries.forEach((e) => {
    if (!(e.courseId in courseColorMap)) {
      courseColorMap[e.courseId] = colorCounter++;
    }
    if (!entryMap[e.dayOfWeek]) entryMap[e.dayOfWeek] = {};
    if (!entryMap[e.dayOfWeek][e.startHour]) entryMap[e.dayOfWeek][e.startHour] = [];
    entryMap[e.dayOfWeek][e.startHour].push({ entry: e, colorIdx: courseColorMap[e.courseId] });
  });

  return (
    <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/80 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-white/70">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/80 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className="w-14 p-2" />
              {DAYS.map((day, i) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                const isToday =
                  weekOffset === 0 &&
                  new Date().toDateString() === date.toDateString();
                return (
                  <th key={day} className="p-2 text-center">
                    <div className={`text-xs font-semibold ${isToday ? "text-accent" : "text-white/50"}`}>
                      {day.slice(0, 3)}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isToday ? "text-accent/70" : "text-white/25"}`}>
                      {date.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-t border-white/[0.04]">
                <td className="text-[11px] text-white/25 text-right pr-3 py-2 font-mono align-top pt-2.5">
                  {hour}:00
                </td>
                {DAYS.map((_, dayIdx) => {
                  const cells = entryMap[dayIdx]?.[hour] ?? [];
                  const isCovered = HOURS.slice(0, HOURS.indexOf(hour)).some((h) =>
                    (entryMap[dayIdx]?.[h] ?? []).some(
                      ({ entry }) => h + entry.durationHours > hour
                    )
                  );
                  if (isCovered) return null;

                  return (
                    <td
                      key={dayIdx}
                      className="p-1 align-top"
                      style={{ minHeight: "40px" }}
                    >
                      {cells.map(({ entry, colorIdx }) => {
                        const c = getColor(colorIdx);
                        const heightClass = entry.durationHours >= 2 ? "min-h-[76px]" : "min-h-[36px]";
                        return (
                          <div
                            key={entry.id}
                            className={`${c.bg} border ${c.border} rounded-lg px-2 py-1.5 ${heightClass} flex flex-col justify-between`}
                          >
                            <div className={`text-[10px] font-semibold ${c.text} leading-tight truncate`}>
                              {entry.course?.code ?? `Ders ${entry.courseId}`}
                            </div>
                            {entry.course?.name && (
                              <div className="text-[9px] text-white/40 leading-tight truncate mt-0.5">
                                {entry.course.name}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={8} className="text-white/25" />
                              <span className="text-[9px] text-white/30">
                                {hour}:00–{hour + entry.durationHours}:00
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
