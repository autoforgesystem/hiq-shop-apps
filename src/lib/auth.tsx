import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DEMO_USERS, type DemoUser } from "../pages/auth/mockUsers";
import { useLocalState } from "./useLocalState";

/**
 * DEMO SIGN-IN ONLY. Accounts and passwords live in this browser, so this only shows how the screens
 * behave. Replace with the customer auth endpoints in /docs/API.md when the backend exists.
 */
export type Customer = Omit<DemoUser, "password">;
type Result = { ok: true } | { ok: false; error: string; field?: string };
interface AuthCtx {
  user: Customer | null;
  login: (email: string, password: string, remember: boolean) => Promise<Result>;
  register: (u: DemoUser) => Promise<Result>;
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

  const login: AuthCtx["login"] = async (email, password, remember) => {
    await wait();
    const u = find(email);
    if (!u || u.password !== password) return { ok: false, error: "That email and password don't match an account. Please try again." };
    signIn(toCustomer(u), remember);
    return { ok: true };
  };
  const register: AuthCtx["register"] = async (u) => {
    await wait();
    if (find(u.email)) return { ok: false, field: "email", error: "An account with this email already exists. Sign in instead." };
    const clean = { ...u, email: u.email.trim(), firstName: u.firstName.trim(), lastName: u.lastName.trim() };
    setRegistered((r) => [...r, clean]);
    signIn(toCustomer(clean));
    return { ok: true };
  };
  const logout = () => { writeSession(null); setUser(null); };

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
