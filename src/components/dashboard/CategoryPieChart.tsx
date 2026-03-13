"use client"

import { useState, useCallback } from "react"
import { useTheme } from "next-themes"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts"

interface CategoryPieChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

function renderActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value, percent,
  } = props

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground text-sm font-semibold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground text-xs">
        ${value.toFixed(0)} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.9}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
    </g>
  )
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const { resolvedTheme } = useTheme()

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined)
  }, [])

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data for selected period</p>
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...{ activeIndex, activeShape: renderActiveShape } as any}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
            cornerRadius={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                stroke="none"
                opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.4}
                style={{ transition: "opacity 200ms ease, filter 200ms ease" }}
              />
            ))}
          </Pie>
          {activeIndex === undefined && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-lg font-bold"
            >
              ${total.toFixed(0)}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {data.map((entry, index) => (
          <button
            key={index}
            className={`flex items-center gap-1.5 text-xs transition-opacity duration-200 cursor-pointer hover:opacity-100 ${
              activeIndex !== undefined && activeIndex !== index ? "opacity-40" : "opacity-100"
            }`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-mono font-medium text-foreground">${entry.value.toFixed(0)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
