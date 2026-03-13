"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
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

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-xl min-w-[180px]">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {label ? formatMonthKey(label) : ""}
      </p>
      {payload.filter(e => e.value > 0).map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-foreground">{entry.name}</span>
          </div>
          <span className="text-xs font-mono font-medium text-foreground">
            ${entry.value.toFixed(0)}
          </span>
        </div>
      ))}
      <div className="border-t border-border/30 mt-2 pt-2 flex justify-between">
        <span className="text-xs font-medium text-muted-foreground">Total</span>
        <span className="text-xs font-mono font-bold text-foreground">${total.toFixed(0)}</span>
      </div>
    </div>
  )
}

export function MonthlyBarChart({ data, categoryNames, categoryColors }: MonthlyBarChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const textColor = isDark ? "#71717a" : "#a1a1aa"
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 4, left: -8, bottom: 4 }}
        onMouseMove={(state) => {
          if (state.activeTooltipIndex !== undefined) {
            setActiveIndex(Number(state.activeTooltipIndex))
          }
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <defs>
          {categoryNames.map((name, idx) => {
            const color = categoryColors[name] ?? "#6366f1"
            return (
              <linearGradient key={idx} id={`bar-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            )
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthKey}
          tick={{ fill: textColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          width={48}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", radius: 8 }}
        />
        {categoryNames.map((name, index) => (
          <Bar
            key={index}
            dataKey={name}
            stackId="a"
            fill={`url(#bar-grad-${index})`}
            radius={index === categoryNames.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            animationBegin={index * 80}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                opacity={activeIndex === null || activeIndex === i ? 1 : 0.3}
                style={{ transition: "opacity 200ms ease" }}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
