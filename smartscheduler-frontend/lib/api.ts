const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string; status?: number };

export async function apiFetch<T = unknown>(
  endpoint: string,
  options?: RequestInit & { token?: string; onUnauthorized?: () => void }
): Promise<ApiResult<T>> {
  const { token, onUnauthorized, headers: extraHeaders, ...rest } = options ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...rest, headers });

    if (res.status === 401) {
      onUnauthorized?.();
      return {
        data: null,
        error: "Oturum süreniz dolmuştur. Lütfen tekrar giriş yapın.",
        status: 401,
      };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        data: null,
        error: text || `Sunucu hatası (${res.status})`,
        status: res.status,
      };
    }

    // 204 No Content (DELETE)
    if (res.status === 204) {
      return { data: null as unknown as T, error: null };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return { data: null as unknown as T, error: null };
    }

    const data: T = await res.json();
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.",
    };
  }
}
