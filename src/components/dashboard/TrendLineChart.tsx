"use client"

import { useTheme } from "next-themes"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface TrendLineChartProps {
  data: Array<{ month: string; total: number }>
}

function formatMonthKey(key: string) {
  const [y, m] = key.split("-")
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleString("en-US", { month: "short", year: "2-digit" })
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const textColor = isDark ? "#9ca3af" : "#6b7280"
  const gridColor = isDark ? "#374151" : "#e5e7eb"
  const accentColor = "#818cf8"
  const tooltipBg = isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"

  const avg = data.length ? data.reduce((s, d) => s + d.total, 0) / data.length : 0

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthKey}
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: unknown) => [`$${Number(value).toFixed(2)}`, "Total"]) as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={formatMonthKey as any}
          contentStyle={{
            background: tooltipBg,
            border: "none",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            backdropFilter: "blur(8px)",
            padding: "8px 14px",
          }}
        />
        <ReferenceLine
          y={avg}
          stroke={textColor}
          strokeDasharray="4 4"
          strokeOpacity={0.6}
          label={{ value: "avg", fill: textColor, fontSize: 11, position: "insideTopRight" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={accentColor}
          strokeWidth={2.5}
          fill="url(#trendGradient)"
          dot={{ r: 3, fill: accentColor, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: accentColor, stroke: isDark ? "#111827" : "#fff", strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
