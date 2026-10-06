import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DEMO_USERS, type DemoUser } from "../pages/auth/mockUsers";
import { useLocalState } from "./useLocalState";
import { api, ApiError, tokens, useApi } from "./api";

/**
 * Customer sign-in. With VITE_API_URL set it uses the HIQ API (../server); otherwise it is a DEMO that keeps
 * accounts and passwords in this browser, only to show how the screens behave.
 */
export type Customer = Omit<DemoUser, "password">;
type Result = { ok: true } | { ok: false; error: string; field?: string };
interface AuthCtx {
  user: Customer | null;
  login: (email: string, password: string, remember: boolean) => Promise<Result>;
  register: (u: DemoUser & { marketingOptIn?: boolean }) => Promise<Result>;
  logout: () => void;
}

const SESSION_KEY = "hiq-demo-session";
const Ctx = createContext<AuthCtx | null>(null);
const wait = () => new Promise((r) => setTimeout(r, 600)); // feels like a network call
const toCustomer = (u: DemoUser): Customer => ({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone });
// "Keep me signed in" uses localStorage; otherwise the session ends when the tab closes.
const readSession = (): Customer | null => {
  try { const s = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
};
const writeSession = (u: Customer | null, remember = true) => {
  try {
    localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY);
    if (u) (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(u));
  } catch { /* still signed in for this page view */ }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(readSession);
  const [registered, setRegistered] = useLocalState<DemoUser[]>("hiq-demo-users", []);
  const find = (email: string) => [...DEMO_USERS, ...registered].find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const signIn = (u: Customer, remember?: boolean) => { writeSession(u, remember); setUser(u); };

  // API mode: refresh the stored profile, and drop the session if the token has expired.
  useEffect(() => {
    if (!useApi || !tokens.get("customer")) return;
    api<Customer>("/auth/me", { auth: "customer" }).then(setUser, (e) => { if (e instanceof ApiError && e.status === 401) { writeSession(null); setUser(null); } });
  }, []);

  const apiSession = async (path: string, body: object, remember = true): Promise<Result> => {
    try {
      const r = await api<{ token: string; customer: Customer }>(path, { body });
      tokens.set("customer", r.token, remember);
      signIn(r.customer, remember);
      return { ok: true };
    } catch (e) {
      const err = e as ApiError;
      return { ok: false, error: err.message, ...(err.status === 409 && { field: "email" }) };
    }
  };

  const login: AuthCtx["login"] = async (email, password, remember) => {
    if (useApi) return apiSession("/auth/login", { email, password, remember }, remember);
    await wait();
    const u = find(email);
    if (!u || u.password !== password) return { ok: false, error: "That email and password don't match an account. Please try again." };
    signIn(toCustomer(u), remember);
    return { ok: true };
  };
  const register: AuthCtx["register"] = async (u) => {
    if (useApi) return apiSession("/auth/register", u);
    await wait();
    if (find(u.email)) return { ok: false, field: "email", error: "An account with this email already exists. Sign in instead." };
    const clean = { ...u, email: u.email.trim(), firstName: u.firstName.trim(), lastName: u.lastName.trim() };
    const { marketingOptIn: _optIn, ...account } = clean;
    setRegistered((r) => [...r, account]);
    signIn(toCustomer(clean));
    return { ok: true };
  };
  const logout = () => { tokens.set("customer", null); writeSession(null); setUser(null); };

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};

/** Sends signed-out visitors to /login and brings them back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}

/** Only allow same-site redirects after sign-in. */
export const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/account");
