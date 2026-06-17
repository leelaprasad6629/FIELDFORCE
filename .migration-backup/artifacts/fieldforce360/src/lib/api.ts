import { useAuth } from "@clerk/clerk-react";

const API_BASE = "/api";

export function useApi() {
  const { getToken } = useAuth();

  async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  }

  return { fetchApi };
}
