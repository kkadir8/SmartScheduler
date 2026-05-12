"use client";

import { useEffect, useState } from "react";
import { DoorOpen, Users, Monitor } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ApiError from "../components/ApiError";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Classroom {
  id: number;
  name: string;
  capacity: number;
  hasLab: boolean;
  building?: string;
  hasProjector?: boolean;
}

function capacityVariant(pct: number): "success" | "warning" | "error" {
  if (pct < 60) return "success";
  if (pct < 85) return "warning";
  return "error";
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-xl skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 rounded skeleton" />
        <div className="h-3 w-20 rounded skeleton" />
      </div>
      <div className="w-24 h-2 rounded-full skeleton" />
      <div className="w-16 h-5 rounded-full skeleton" />
    </div>
  );
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchClassrooms = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE}/api/classrooms`);
      const data = await res.json();
      setClassrooms(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const labCount = classrooms.filter((c) => c.hasLab).length;
  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Derslikler</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {loading ? "Yükleniyor..." : `${classrooms.length} derslik — toplam ${totalCapacity} kişilik kapasite`}
          </p>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-cardbg border border-white/[0.06] px-3 py-1.5 rounded-xl">
              <Monitor size={13} className="text-purple-400" />
              <span className="text-xs text-white/50">{labCount} Lab</span>
            </div>
            <div className="flex items-center gap-1.5 bg-cardbg border border-white/[0.06] px-3 py-1.5 rounded-xl">
              <DoorOpen size={13} className="text-blue-400" />
              <span className="text-xs text-white/50">{classrooms.length - labCount} Sınıf</span>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <ApiError onRetry={fetchClassrooms} />
      ) : (
        <div className="bg-cardbg border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.06]">
            <div className="w-10" />
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
              Sınıf Adı
            </div>
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
              Kapasite
            </div>
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
              Tür
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : classrooms.map((classroom, idx) => {
                  const maxCapacity = 60;
                  const pct = Math.round((classroom.capacity / maxCapacity) * 100);
                  const variant = capacityVariant(pct);
                  return (
                    <div
                      key={classroom.id}
                      className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors group animate-fadeIn"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          classroom.hasLab
                            ? "bg-purple-500/10 border border-purple-500/20"
                            : "bg-blue-500/10 border border-blue-500/20"
                        }`}
                      >
                        {classroom.hasLab ? (
                          <Monitor size={16} className="text-purple-400" />
                        ) : (
                          <DoorOpen size={16} className="text-blue-400" />
                        )}
                      </div>

                      {/* Name */}
                      <div>
                        <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                          {classroom.name}
                        </div>
                        {classroom.building && (
                          <div className="text-[11px] text-white/30 mt-0.5">
                            {classroom.building}
                          </div>
                        )}
                      </div>

                      {/* Capacity bar */}
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                variant === "success"
                                  ? "bg-emerald-400"
                                  : variant === "warning"
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Users size={12} className="text-white/30" />
                            <span className="text-xs font-medium text-white/60">
                              {classroom.capacity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Type badge */}
                      <div>
                        {classroom.hasLab ? (
                          <StatusBadge variant="purple">
                            <Monitor size={9} />
                            Lab
                          </StatusBadge>
                        ) : (
                          <StatusBadge variant="info">
                            <DoorOpen size={9} />
                            Sınıf
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Footer summary */}
          {!loading && !error && (
            <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-white/25">
                {classrooms.length} derslik listeleniyor
              </span>
              <span className="text-xs text-white/25">
                Ortalama kapasite: {Math.round(totalCapacity / (classrooms.length || 1))} kişi
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
