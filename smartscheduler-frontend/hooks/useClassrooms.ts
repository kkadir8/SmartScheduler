"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Classroom } from "@/types";

export function useClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await apiFetch<Classroom[]>("/api/classrooms");
    if (err) setError(true);
    else setClassrooms(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { classrooms, loading, error, refetch };
}
