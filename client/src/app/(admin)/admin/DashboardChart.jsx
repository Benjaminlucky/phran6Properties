"use client";

// Split out of DashboardClient so `recharts` lands in its own lazily-loaded
// chunk instead of the initial /admin bundle. DashboardClient pulls this in
// via next/dynamic with ssr:false — a chart renders nothing meaningful
// without JS, so there is no SSR/SEO value to preserve here.

import { useState } from "react";
import { TrendingUp, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Area,
} from "recharts";

// ── Custom recharts tooltip ───────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E2E8F0",
        borderRadius: "0.625rem",
        padding: "0.625rem 0.875rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      <p
        style={{
          margin: "0 0 0.25rem",
          fontSize: "0.75rem",
          color: "#94A3B8",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "1rem",
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {payload[0].value}{" "}
        <span
          style={{ fontSize: "0.75rem", fontWeight: 500, color: "#94A3B8" }}
        >
          enquiries
        </span>
      </p>
    </div>
  );
}

// ── Recharts chart ────────────────────────────────────────────────
export default function EnquiryChart({ data, loading }) {
  const [chartType, setChartType] = useState("bar");

  if (loading) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={16} style={{ color: "#FF6B6B" }} />
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#0F172A",
                margin: 0,
              }}
            >
              Enquiries — Last 6 Months
            </h2>
          </div>
        </div>
        <div
          style={{
            height: "200px",
            borderRadius: "0.75rem",
            background: "#F8FAFC",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <TrendingUp size={16} style={{ color: "#FF6B6B" }} />
          <h2
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#0F172A",
              margin: 0,
            }}
          >
            Enquiries — Last 6 Months
          </h2>
        </div>
        <div
          style={{
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "0.5rem",
            color: "#94A3B8",
          }}
        >
          <BarChart2 size={28} style={{ opacity: 0.4 }} />
          <p style={{ fontSize: "0.875rem", margin: 0 }}>No enquiry data yet</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);
  const peak = data.reduce((p, d) => (d.count > p.count ? d : p), data[0]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <TrendingUp size={16} style={{ color: "#FF6B6B" }} />
          <div>
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#0F172A",
                margin: 0,
              }}
            >
              Enquiries — Last 6 Months
            </h2>
            <p style={{ fontSize: "0.75rem", color: "#94A3B8", margin: 0 }}>
              {total} total · Peak: {peak.month} ({peak.count})
            </p>
          </div>
        </div>
        {/* Bar / Line toggle */}
        <div
          style={{
            display: "flex",
            background: "#F1F5F9",
            borderRadius: "0.5rem",
            padding: "0.25rem",
            gap: "0.25rem",
          }}
        >
          {["bar", "line"].map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "0.375rem",
                border: "none",
                background: chartType === type ? "white" : "transparent",
                color: chartType === type ? "#0F172A" : "#94A3B8",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                boxShadow:
                  chartType === type ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 150ms",
                textTransform: "capitalize",
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        {chartType === "bar" ? (
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            barCategoryGap="35%"
          >
            <defs>
              <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#E85555" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 11,
                fill: "#94A3B8",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 11,
                fill: "#94A3B8",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFC" }} />
            <Bar
              dataKey="count"
              fill="url(#coralGrad)"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        ) : (
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 11,
                fill: "#94A3B8",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 11,
                fill: "#94A3B8",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              fill="url(#areaGrad)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#FF6B6B"
              strokeWidth={2.5}
              dot={{ fill: "#FF6B6B", strokeWidth: 0, r: 4 }}
              activeDot={{
                r: 6,
                fill: "#FF6B6B",
                stroke: "white",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>

      {/* Month summary strip */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #F1F5F9",
          overflowX: "auto",
        }}
      >
        {data.map((d) => (
          <div
            key={d.month}
            style={{
              flex: "0 0 auto",
              textAlign: "center",
              minWidth: "2.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: d.count === peak.count ? "#FF6B6B" : "#0F172A",
                margin: "0 0 0.2rem",
              }}
            >
              {d.count}
            </p>
            <p style={{ fontSize: "0.65rem", color: "#94A3B8", margin: 0 }}>
              {d.month}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
