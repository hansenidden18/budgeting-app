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
  const isDark = resolvedTheme === "dark"
  const tooltipBg = isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"

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
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string | undefined) => [
            value != null ? `$${Number(value).toFixed(2)}` : "",
          ]}
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
      </PieChart>
    </ResponsiveContainer>
  )
}
