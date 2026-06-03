"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { DAYS, HOURS } from "@/lib/constants";
import type { ScheduleEntry } from "@/types";

export type { ScheduleEntry };

// Her ders kodu ilk göründüğünde bu listeden sırasıyla renk alır.
// courseColorMap sayesinde aynı ders tüm tabloda hep aynı renkte görünür.
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

export default function CalendarView({
  entries,
  onEntryClick,
}: {
  entries: ScheduleEntry[];
  onEntryClick?: (entry: ScheduleEntry) => void;
}) {
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

  // entryMap[gün][saat] → o hücredeki ders listesi
  // Yapı: dayOfWeek (0-4) → startHour (8-18) → [{entry, colorIdx}]
  // Tek geçişte hem lookup tablosu hem renk ataması yapılır.
  const entryMap: Record<number, Record<number, { entry: ScheduleEntry; colorIdx: number }[]>> = {};
  const courseColorMap: Record<number, number> = {}; // courseId → renk indeksi
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
                  // Bir önceki saat dersinin bloğu bu saati kaplıyor mu?
                  // (örn. 09:00'da 2 saatlik ders varsa 10:00 hücresi "kapsanmış")
                  const isCovered = HOURS.slice(0, HOURS.indexOf(hour)).some((h) =>
                    (entryMap[dayIdx]?.[h] ?? []).some(
                      ({ entry }) => h + entry.durationHours > hour
                    )
                  );
                  // Kapsanan ama dersiz hücreyi GİZLE değil, boş <td> olarak tut.
                  // null döndürürsek <td> tablo satırından düşer → sonraki sütunlar sola kayar.
                  if (isCovered && cells.length === 0)
                    return <td key={dayIdx} className="p-1" style={{ minHeight: "40px" }} />;

                  return (
                    <td
                      key={dayIdx}
                      className="p-1 align-top"
                      style={{ minHeight: "40px" }}
                    >
                      {cells.map(({ entry, colorIdx }) => {
                        const c = getColor(colorIdx);
                        const entryHeight = entry.durationHours * 40 - 4;
                        return (
                          <div
                            key={entry.id}
                            onClick={() => onEntryClick?.(entry)}
                            style={{ minHeight: `${entryHeight}px` }}
                            className={`${c.bg} border ${c.border} rounded-lg px-2 py-1.5 flex flex-col justify-between ${onEntryClick ? "cursor-pointer hover:brightness-125 transition-all" : ""}`}
                          >
                            <div className={`text-[10px] font-semibold ${c.text} leading-tight truncate`}>
                              {entry.course?.code ?? `Ders ${entry.courseId}`}
                            </div>
                            {entry.course?.name && (
                              <div className="text-[9px] text-white/40 leading-tight truncate mt-0.5">
                                {entry.course.name}
                              </div>
                            )}
                            {entry.instructor?.name && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <User size={8} className="text-white/30" />
                                <span className="text-[9px] text-white/45 leading-tight truncate">
                                  {entry.instructor.name}
                                </span>
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
