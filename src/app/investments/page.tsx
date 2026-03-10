"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PortfolioSummary } from "@/components/investments/PortfolioSummary"
import { HoldingsTable } from "@/components/investments/HoldingsTable"
import { InvestmentForm } from "@/components/investments/InvestmentForm"
import type { Investment } from "@/lib/types"

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Investment | undefined>()
  const [refreshing, setRefreshing] = useState(false)

  const fetchInvestments = useCallback(async () => {
    const res = await fetch("/api/investments")
    setInvestments(await res.json())
  }, [])

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  async function handleRefreshPrices() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/investments/refresh-prices", { method: "POST" })
      const data = await res.json()
      if (data.updated > 0) {
        toast.success(`Updated ${data.updated} price${data.updated > 1 ? "s" : ""}`)
      }
      if (data.errors?.length > 0) {
        for (const err of data.errors) {
          toast.error(`${err.ticker}: ${err.error}`)
        }
      }
      if (data.updated === 0 && (!data.errors || data.errors.length === 0)) {
        toast.info("No investments with tickers to refresh")
      }
      await fetchInvestments()
    } catch {
      toast.error("Failed to refresh prices")
    } finally {
      setRefreshing(false)
    }
  }

  const latestUpdate = investments
    .filter((inv) => inv.priceUpdatedAt)
    .map((inv) => new Date(inv.priceUpdatedAt!).getTime())
    .sort((a, b) => b - a)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investments</h1>
          <p className="text-sm text-muted-foreground">Track your portfolio performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshPrices} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Prices"}
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Holding
          </Button>
        </div>
      </div>

      {latestUpdate && (
        <p className="text-xs text-muted-foreground">
          Prices last updated: {new Date(latestUpdate).toLocaleString()}
        </p>
      )}

      <PortfolioSummary investments={investments} />

      <HoldingsTable
        investments={investments}
        onEdit={(inv) => setEditing(inv)}
        onRefresh={fetchInvestments}
      />

      <InvestmentForm
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchInvestments}
      />

      {editing && (
        <InvestmentForm
          investment={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
          onSuccess={fetchInvestments}
        />
      )}
    </div>
  )
}
