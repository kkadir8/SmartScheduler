"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Course } from "@/types";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await apiFetch<Course[]>("/api/courses");
    if (err) setError(true);
    else setCourses(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { courses, loading, error, refetch };
}
