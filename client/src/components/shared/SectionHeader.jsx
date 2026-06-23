export default function SectionHeader({
  title,
  subtitle,
  align = "center",
  light = false,
}) {
  const alignClass = {
    center: "text-center mx-auto",
    left: "text-left",
    right: "text-right ml-auto",
  }[align];

  return (
    <div className={`max-w-2xl mb-10 ${alignClass}`}>
      <h2
        className="font-extrabold leading-tight mb-3"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "var(--text-h2)",
          color: light ? "white" : "var(--color-secondary)",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-base leading-relaxed"
          style={{
            color: light
              ? "rgba(255,255,255,0.7)"
              : "var(--color-text-secondary)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
