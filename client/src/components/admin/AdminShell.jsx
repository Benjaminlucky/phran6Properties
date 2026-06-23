"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminShell({ children, newEnquiries = 0 }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [loading, isAuthenticated, router]);

  const spinner = (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        background: "linear-gradient(135deg, #060B14 0%, #0F172A 100%)",
      }}
    >
      <div
        style={{
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "0.75rem",
          background: "var(--color-primary, #b2ff70)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.25))",
        }}
      >
        <Loader2
          size={20}
          style={{ color: "var(--color-secondary, #1b2f31)", animation: "spin 1s linear infinite" }}
        />
      </div>
      <p
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "0.875rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Verifying session…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (loading) return spinner;
  if (!isAuthenticated) return null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <AdminSidebar newEnquiries={newEnquiries} />
      <main
        className="admin-main-content"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}
