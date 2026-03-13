"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts"

interface TrendLineChartProps {
  data: Array<{ month: string; total: number }>
}

function formatMonthKey(key: string) {
  const [y, m] = key.split("-")
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleString("en-US", { month: "short", year: "2-digit" })
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null

  const value = payload[0].value

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label ? formatMonthKey(label) : ""}</p>
      <p className="text-lg font-bold font-mono text-foreground">${value.toFixed(0)}</p>
    </div>
  )
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const textColor = isDark ? "#71717a" : "#a1a1aa"
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
  const accentColor = isDark ? "#818cf8" : "#6366f1"
  const accentColorLight = isDark ? "#818cf830" : "#6366f120"

  const avg = data.length ? data.reduce((s, d) => s + d.total, 0) / data.length : 0
  const max = data.length ? Math.max(...data.map(d => d.total)) : 0
  const min = data.length ? Math.min(...data.map(d => d.total)) : 0
  const latest = data.length ? data[data.length - 1].total : 0
  const prev = data.length > 1 ? data[data.length - 2].total : latest
  const change = prev > 0 ? ((latest - prev) / prev) * 100 : 0

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
  }

  return (
    <div>
      {/* Summary stats */}
      <div className="flex gap-6 mb-4 px-1">
        <div>
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="text-sm font-mono font-semibold">${avg.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Peak</p>
          <p className="text-sm font-mono font-semibold">${max.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Low</p>
          <p className="text-sm font-mono font-semibold">${min.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Trend</p>
          <p className={`text-sm font-mono font-semibold ${change > 0 ? "text-red-500" : change < 0 ? "text-emerald-500" : ""}`}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.25} />
              <stop offset="50%" stopColor={accentColor} stopOpacity={0.08} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
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
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avg}
            stroke={textColor}
            strokeDasharray="6 4"
            strokeOpacity={0.4}
            label={{
              value: `avg $${avg.toFixed(0)}`,
              fill: textColor,
              fontSize: 10,
              position: "insideTopRight",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={accentColor}
            strokeWidth={2.5}
            fill="url(#trendGradient)"
            dot={(props: any) => {
              const { cx, cy, index } = props
              const isLast = index === data.length - 1
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={isLast ? 5 : 3}
                  fill={accentColor}
                  stroke={isDark ? "#18181b" : "#ffffff"}
                  strokeWidth={isLast ? 3 : 2}
                  style={{ filter: isLast ? "url(#glow)" : undefined }}
                />
              )
            }}
            activeDot={{
              r: 6,
              fill: accentColor,
              stroke: isDark ? "#18181b" : "#ffffff",
              strokeWidth: 3,
              style: { filter: "url(#glow)" },
            }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
