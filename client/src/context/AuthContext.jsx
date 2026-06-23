"use client";

import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

const TOKEN_KEY = "nr_token";
const USER_KEY = "nr_user";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getTokenExp(token) {
  try {
    if (!token || typeof token !== "string") return 0;
    const parts = token.split(".");
    if (parts.length !== 3) return 0;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded));
    if (payload.exp) return payload.exp * 1000;
    if (payload.iat) return payload.iat * 1000 + TTL_MS;
    return Date.now() + TTL_MS;
  } catch {
    return 0;
  }
}

function isValid(token) {
  const exp = getTokenExp(token);
  return exp > Date.now() + 60_000;
}

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

  const doLogout = useCallback(
    (msg) => {
      clearTimer();
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = `${TOKEN_KEY}=;path=/;max-age=0`;
      setUser(null);
      setLoading(false);
      booted.current = false;
      if (msg) toast.error(msg, { id: "auth-msg" });
      routerRef.current.replace("/admin/login");
    },
    [clearTimer],
  );

  const MAX_TIMEOUT = 2_147_483_647;

  const scheduleExpiry = useCallback(
    (token) => {
      clearTimer();
      const exp = getTokenExp(token);
      const ms = exp - Date.now();

      if (ms <= 0) {
        doLogout("Session expired. Please log in again.");
        return;
      }

      if (ms > MAX_TIMEOUT) {
        timer.current = setTimeout(() => {
          scheduleExpiry(token);
        }, MAX_TIMEOUT);
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

    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    if (!isValid(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setLoading(false);
      return;
    }

    let cached = null;
    try {
      cached = JSON.parse(userRaw);
    } catch {
      localStorage.removeItem(USER_KEY);
    }

    if (cached) {
      setUser(cached);
      setLoading(false);
      scheduleExpiry(token);

      authApi
        .me()
        .then((r) => {
          if (r?.data) {
            setUser(r.data);
            localStorage.setItem(USER_KEY, JSON.stringify(r.data));
          }
        })
        .catch(() => {});
    } else {
      authApi
        .me()
        .then((r) => {
          if (r?.data) {
            localStorage.setItem(USER_KEY, JSON.stringify(r.data));
            setUser(r.data);
            scheduleExpiry(token);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        })
        .catch((err) => {
          const status = err?.status || err?.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password });

      const token = res?.data?.token;
      const u = res?.data?.user;

      if (!token || !u) throw new Error("Invalid server response");

      const exp = getTokenExp(token);
      const ms = exp - Date.now();

      if (exp <= Date.now()) {
        throw new Error("Received an already-expired token from server");
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(u));

      const max = Math.floor(ms / 1000);
      const sec = location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `${TOKEN_KEY}=${token};path=/;max-age=${max};SameSite=Lax${sec}`;

      setUser(u);
      setLoading(false);
      booted.current = true;
      scheduleExpiry(token);
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
