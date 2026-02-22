"use client"

import { useTheme } from "next-themes"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
  const textColor = resolvedTheme === "dark" ? "#9ca3af" : "#6b7280"
  const gridColor = resolvedTheme === "dark" ? "#374151" : "#f3f4f6"

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
          formatter={((value: unknown, name: unknown) => [
            value != null ? `$${Number(value).toFixed(2)}` : "",
            name,
          ]) as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={formatMonthKey as any}
          contentStyle={{
            background: resolvedTheme === "dark" ? "#1f2937" : "#fff",
            border: "1px solid " + gridColor,
            borderRadius: 8,
          }}
        />
        <Legend />
        {categoryNames.map((name) => (
          <Bar
            key={name}
            dataKey={name}
            stackId="a"
            fill={categoryColors[name] ?? "#6366f1"}
            radius={categoryNames.indexOf(name) === categoryNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
