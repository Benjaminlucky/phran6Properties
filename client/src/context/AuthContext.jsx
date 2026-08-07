"use client";

import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

/**
 * Session model
 * ─────────────
 * The JWT itself lives in an httpOnly `nr_token` cookie set by the API on
 * /auth/login. It is deliberately unreadable from JavaScript, so nothing here
 * decodes or even sees it — requests carry it automatically because every call
 * in lib/api.js uses `credentials: "include"`.
 *
 * What we DO keep in localStorage is non-sensitive:
 *   nr_user       — cached {name, email, role} purely for optimistic first paint
 *   nr_expires_at — plain epoch-ms number, so we can pre-emptively log out at
 *                   expiry instead of waiting for the first 401
 * Neither is a credential; clearing them logs nobody in or out on its own.
 */
const USER_KEY = "nr_user";
const EXP_KEY = "nr_expires_at";

// setTimeout silently fires immediately past this, so long waits are chunked.
const MAX_TIMEOUT = 2_147_483_647;

export const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);
  const booted = useRef(false);
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(EXP_KEY);
    } catch {}
  }, []);

  const doLogout = useCallback(
    (msg) => {
      clearTimer();

      // Ask the server to clear the real httpOnly cookie. Fire-and-forget —
      // navigation must not wait on (or be blocked by) the network.
      authApi.logout().catch(() => {});

      clearSession();
      setUser(null);
      setLoading(false);
      booted.current = false;
      if (msg) toast.error(msg, { id: "auth-msg" });
      routerRef.current.replace("/admin/login");
    },
    [clearTimer, clearSession],
  );

  /** @param {number} expiresAt epoch ms */
  const scheduleExpiry = useCallback(
    (expiresAt) => {
      clearTimer();
      if (!expiresAt || !Number.isFinite(expiresAt)) return;

      const ms = expiresAt - Date.now();

      if (ms <= 0) {
        doLogout("Session expired. Please log in again.");
        return;
      }

      if (ms > MAX_TIMEOUT) {
        timer.current = setTimeout(() => scheduleExpiry(expiresAt), MAX_TIMEOUT);
        return;
      }

      timer.current = setTimeout(() => {
        doLogout("Session expired. Please log in again.");
      }, ms);
    },
    [clearTimer, doLogout],
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    // There is no client-readable token to gate on any more, so always ask the
    // server who we are — the cookie (if any) rides along automatically.
    let cached = null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {
      try {
        localStorage.removeItem(USER_KEY);
      } catch {}
    }

    let cachedExp = 0;
    try {
      cachedExp = Number(localStorage.getItem(EXP_KEY)) || 0;
    } catch {}

    if (cached) {
      // Optimistic paint, then reconcile below.
      setUser(cached);
      setLoading(false);
      if (cachedExp) scheduleExpiry(cachedExp);
    }

    authApi
      .me()
      .then((r) => {
        if (r?.data) {
          setUser(r.data);
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(r.data));
          } catch {}
          if (cachedExp) scheduleExpiry(cachedExp);
        } else {
          clearSession();
          setUser(null);
        }
      })
      .catch((err) => {
        const status = err?.status || err?.response?.status;
        if (status === 401 || status === 403) {
          // Cookie missing/expired/invalid — drop the optimistic user.
          clearTimer();
          clearSession();
          setUser(null);
        }
        // Any other error (network/500) leaves the cached user in place.
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password });

      // Response shape is now { user, expiresAt } — no token, by design.
      const u = res?.data?.user;
      const expiresAt = Number(res?.data?.expiresAt) || 0;

      if (!u) throw new Error("Invalid server response");
      if (expiresAt && expiresAt <= Date.now()) {
        throw new Error("Received an already-expired session from server");
      }

      try {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        if (expiresAt) localStorage.setItem(EXP_KEY, String(expiresAt));
        else localStorage.removeItem(EXP_KEY);
      } catch {}

      setUser(u);
      setLoading(false);
      booted.current = true;
      if (expiresAt) scheduleExpiry(expiresAt);
      return u;
    },
    [scheduleExpiry],
  );

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login,
        logout: doLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
