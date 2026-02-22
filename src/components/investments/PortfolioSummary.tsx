"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { Investment } from "@/lib/types"

interface PortfolioSummaryProps {
  investments: Investment[]
}

export function PortfolioSummary({ investments }: PortfolioSummaryProps) {
  const totalValue = investments.reduce((sum, inv) => sum + (inv.marketValue ?? 0), 0)
  const totalGainLoss = investments.reduce((sum, inv) => sum + (inv.gainLossDollar ?? 0), 0)
  const totalCost = investments.reduce((sum, inv) => {
    if (inv.quantity != null) return sum + inv.quantity * inv.avgBuyPrice
    return sum + inv.avgBuyPrice
  }, 0)
  const totalPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-muted-foreground">{investments.length} holding(s)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Gain / Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totalGainLoss)}
          </p>
          <p className="text-xs text-muted-foreground">vs cost basis</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Overall Return</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${totalPct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {totalPct >= 0 ? "+" : ""}{totalPct.toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground">cost basis {formatCurrency(totalCost)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
