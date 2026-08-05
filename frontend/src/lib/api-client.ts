const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function joinUrl(base: string, path: string) {
  if (!base) return path;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown; token?: string | null; timeoutMs?: number },
): Promise<T> {
  const url = joinUrl(API_BASE, path);
  const headers = new Headers(init?.headers ?? {});
  if (init?.json !== undefined) headers.set("content-type", "application/json");
  if (init?.token) headers.set("authorization", `Bearer ${init.token}`);
  const controller = init?.timeoutMs ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), init?.timeoutMs) : undefined;

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: init?.signal ?? controller?.signal,
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    });

    if (!res.ok) {
      const body = await safeJson(res);
      const msg = (body && typeof body === "object" && "error" in body ? body.error : null) as
        | string
        | null;
      throw new Error(msg ?? `Request failed (${res.status})`);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function safeJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function hasApiBase() {
  return Boolean(API_BASE);
}
