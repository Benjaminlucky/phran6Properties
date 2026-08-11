import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import { Loader2 } from "lucide-react";

// page.jsx is a Server Component — wrap the client form in Suspense because
// ResetPasswordForm uses useSearchParams() to read the emailed token.
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #060B14 0%, #0F172A 100%)",
          }}
        >
          <Loader2
            size={32}
            style={{ color: "var(--color-primary, #b2ff70)", animation: "spin 1s linear infinite" }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
