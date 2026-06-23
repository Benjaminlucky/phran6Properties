export default function PublicLoading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Skeleton hero bar */}
        <div
          style={{
            height: "2rem",
            background: "linear-gradient(90deg, #f1f5f1 25%, #e4ede4 50%, #f1f5f1 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            maxWidth: "420px",
          }}
        />
        <div
          style={{
            height: "1rem",
            background: "linear-gradient(90deg, #f1f5f1 25%, #e4ede4 50%, #f1f5f1 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            borderRadius: "0.5rem",
            marginBottom: "2.5rem",
            maxWidth: "260px",
          }}
        />

        {/* Skeleton card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: "1rem",
                overflow: "hidden",
                border: "1px solid #e8ede8",
              }}
            >
              <div
                style={{
                  height: "200px",
                  background: "linear-gradient(90deg, #f1f5f1 25%, #e4ede4 50%, #f1f5f1 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                }}
              />
              <div style={{ padding: "1rem" }}>
                <div
                  style={{
                    height: "1rem",
                    background: "linear-gradient(90deg, #f1f5f1 25%, #e4ede4 50%, #f1f5f1 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s infinite",
                    borderRadius: "0.375rem",
                    marginBottom: "0.5rem",
                  }}
                />
                <div
                  style={{
                    height: "0.75rem",
                    width: "60%",
                    background: "linear-gradient(90deg, #f1f5f1 25%, #e4ede4 50%, #f1f5f1 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s infinite",
                    borderRadius: "0.375rem",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
