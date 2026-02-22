"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodFilter } from "@/components/dashboard/PeriodFilter"
import { MonthlyBarChart } from "@/components/dashboard/MonthlyBarChart"
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart"
import { TrendLineChart } from "@/components/dashboard/TrendLineChart"
import { YtdSummaryTable } from "@/components/dashboard/YtdSummaryTable"
import { formatCurrency } from "@/lib/utils"
import type { DashboardData } from "@/lib/types"

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
    fetchData()
  }, [fetchData])

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
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selected Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data ? formatCurrency(data.selectedMonthTotal) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Year to Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data ? formatCurrency(data.ytdTotal) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Largest Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data?.largestCategory?.name ?? "—"}
            </p>
            {data?.largestCategory && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(data.largestCategory.amount)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
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
      </div>

      {/* Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {!loading && data && <TrendLineChart data={data.monthlyTotals} />}
        </CardContent>
      </Card>

      {/* YTD Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Year-to-Date Summary ({year})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!loading && data && <YtdSummaryTable ytdTable={data.ytdTable} />}
        </CardContent>
      </Card>
    </div>
  )
}
