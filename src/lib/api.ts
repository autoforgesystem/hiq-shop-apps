/**
 * Client for the HIQ Shop API (../server). Only used when VITE_API_URL is set, e.g. http://localhost:3000/api.
 * Without it the shop keeps running on mock data and browser storage.
 */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";
export const useApi = !!API_URL;

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

// Tokens are kept per kind so a customer session and an admin session don't overwrite each other.
const TOKEN_KEYS = { customer: "hiq-api-token", admin: "hiq-api-admin-token" } as const;
type Kind = keyof typeof TOKEN_KEYS;

/** "Keep me signed in" stores the token in localStorage; otherwise it lasts until the tab closes. */
export const tokens = {
  get(kind: Kind) {
    try { return localStorage.getItem(TOKEN_KEYS[kind]) ?? sessionStorage.getItem(TOKEN_KEYS[kind]); } catch { return null; }
  },
  set(kind: Kind, token: string | null, remember = true) {
    try {
      localStorage.removeItem(TOKEN_KEYS[kind]); sessionStorage.removeItem(TOKEN_KEYS[kind]);
      if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEYS[kind], token);
    } catch { /* storage blocked: signed in for this page view only */ }
  },
};

/** Nest sends `message` as a string, or a list of validation messages. */
const errorText = (body: unknown, status: number) => {
  const m = (body as { message?: string | string[] } | null)?.message;
  if (Array.isArray(m)) return m[0] ?? "Please check the form.";
  if (typeof m === "string") return m;
  return status >= 500 ? "Something went wrong on our side. Please try again." : "The request could not be completed.";
};

export async function api<T>(path: string, opts: { method?: string; body?: unknown; auth?: Kind; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const token = opts.auth && tokens.get(opts.auth);
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(API_URL + path, { method: opts.method ?? (opts.body !== undefined || opts.form ? "POST" : "GET"), headers, body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined) });
  } catch {
    throw new ApiError("Can't reach the HIQ server. Check your connection and try again.", 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && opts.auth) tokens.set(opts.auth, null); // expired or revoked session
    throw new ApiError(errorText(body, res.status), res.status);
  }
  return body as T;
}
