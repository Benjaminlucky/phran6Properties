"use client";

import { useAuth } from "@/context/AuthContext";

// Simple hook — AdminShell now handles redirect directly
// Kept for backward compatibility
export function useRequireAuth() {
  return useAuth();
}
