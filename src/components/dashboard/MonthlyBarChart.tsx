"use client"

import { useTheme } from "next-themes"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

interface MonthlyBarChartProps {
  data: Array<{ month: string; [key: string]: number | string }>
  categoryNames: string[]
  categoryColors: Record<string, string>
}

function formatMonthKey(key: string) {
  const [y, m] = key.split("-")
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleString("en-US", { month: "short", year: "2-digit" })
}

export function MonthlyBarChart({ data, categoryNames, categoryColors }: MonthlyBarChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const textColor = isDark ? "#9ca3af" : "#6b7280"
  const gridColor = isDark ? "#374151" : "#e5e7eb"
  const tooltipBg = isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"
  const cursorFill = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
          cursor={{ fill: cursorFill }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: unknown, name: unknown) => [
            value != null ? `$${Number(value).toFixed(2)}` : "",
            name,
          ]) as any}
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
        <Legend />
        {categoryNames.map((name, index) => (
          <Bar
            key={name}
            dataKey={name}
            stackId="a"
            fill={categoryColors[name] ?? "#6366f1"}
            radius={index === categoryNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            isAnimationActive={true}
            animationDuration={600}
            animationBegin={index * 60}
            animationEasing="ease-out"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
