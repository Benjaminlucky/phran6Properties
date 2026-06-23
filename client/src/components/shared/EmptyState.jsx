import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "No results found",
  message = "Try adjusting your filters or search terms.",
  action,
}) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "5rem 2rem",
      }}
    >
      <div
        style={{
          width: "4rem",
          height: "4rem",
          borderRadius: "50%",
          background: "var(--color-primary-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}
      >
        <SearchX size={24} style={{ color: "var(--color-primary)" }} />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "1.125rem",
          color: "var(--color-secondary)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "0.9375rem",
          maxWidth: "360px",
          margin: "0 auto 1.5rem",
        }}
      >
        {message}
      </p>
      {action}
    </div>
  );
}
