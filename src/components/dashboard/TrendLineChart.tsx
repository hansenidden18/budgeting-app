"use client"

import { useTheme } from "next-themes"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
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
  const textColor = resolvedTheme === "dark" ? "#9ca3af" : "#6b7280"
  const gridColor = resolvedTheme === "dark" ? "#374151" : "#e5e7eb"

  const avg = data.length ? data.reduce((s, d) => s + d.total, 0) / data.length : 0

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
            background: resolvedTheme === "dark" ? "#1f2937" : "#fff",
            border: "1px solid " + gridColor,
            borderRadius: 8,
          }}
        />
        <ReferenceLine
          y={avg}
          stroke={textColor}
          strokeDasharray="4 4"
          label={{ value: "avg", fill: textColor, fontSize: 11, position: "insideTopRight" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3, fill: "#6366f1" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
