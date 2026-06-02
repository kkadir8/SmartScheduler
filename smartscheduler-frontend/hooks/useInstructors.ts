"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Instructor } from "@/types";

export function useInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await apiFetch<Instructor[]>("/api/instructors");
    if (err) setError(true);
    else setInstructors(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { instructors, loading, error, refetch };
}
