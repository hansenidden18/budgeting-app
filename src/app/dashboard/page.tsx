"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodFilter } from "@/components/dashboard/PeriodFilter"
import { MonthlyBarChart } from "@/components/dashboard/MonthlyBarChart"
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart"
import { TrendLineChart } from "@/components/dashboard/TrendLineChart"
import { YtdSummaryTable } from "@/components/dashboard/YtdSummaryTable"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, PieChart } from "lucide-react"
import type { DashboardData } from "@/lib/types"

function TrendBadge({ change }: { change: number | null }) {
  if (change === null || change === undefined) return null
  const abs = Math.abs(change)
  if (abs < 0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        no change
      </span>
    )
  }
  const isUp = change > 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isUp ? "text-red-500" : "text-emerald-500"}`}>
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? "+" : ""}{change.toFixed(1)}% vs last month
    </span>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
}

export default function DashboardPage() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?year=${year}&month=${month}`)
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetch("/api/subscriptions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: Number(year), month: Number(month) }),
    }).then(() => fetchData())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <PeriodFilter
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />
      </div>

      {/* KPI Cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.div variants={cardVariants}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Selected Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono">
                {data ? formatCurrency(data.selectedMonthTotal) : "-"}
              </p>
              {data && <TrendBadge change={data.monthOverMonthChange} />}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Year to Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono">
                {data ? formatCurrency(data.ytdTotal) : "-"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Largest Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {data?.largestCategory?.name ?? "-"}
              </p>
              {data?.largestCategory && (
                <p className="text-sm text-muted-foreground font-mono">
                  {formatCurrency(data.largestCategory.amount)}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Insights */}
      {data && data.insights && data.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Month-over-Month Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {data.insights.slice(0, 5).map((insight) => {
                  const isUp = insight.changePercent > 0
                  return (
                    <div
                      key={insight.name}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        isUp
                          ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30"
                          : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span className="font-medium">{insight.name}</span>
                      <span className={isUp ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                        {isUp ? "+" : ""}{insight.changePercent.toFixed(0)}%
                      </span>
                      <span className="text-muted-foreground">
                        ({isUp ? "+" : ""}{formatCurrency(insight.changeDollar)})
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {!loading && data && (
                <MonthlyBarChart
                  data={data.monthlyByCategory}
                  categoryNames={data.categoryNames ?? []}
                  categoryColors={data.categoryColors ?? {}}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {!loading && data && (
                <CategoryPieChart data={data.periodByCategory} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && data && <TrendLineChart data={data.monthlyTotals} />}
          </CardContent>
        </Card>
      </motion.div>

      {/* YTD Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-to-Date Summary ({year})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!loading && data && <YtdSummaryTable ytdTable={data.ytdTable} />}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
