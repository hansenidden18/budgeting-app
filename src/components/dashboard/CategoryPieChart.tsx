"use client"

import { useTheme } from "next-themes"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface CategoryPieChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { resolvedTheme } = useTheme()

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data for selected period</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string | undefined) => [
            value != null ? `$${Number(value).toFixed(2)}` : "",
          ]}
          contentStyle={{
            background: resolvedTheme === "dark" ? "#1f2937" : "#fff",
            borderRadius: 8,
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
