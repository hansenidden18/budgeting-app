"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PortfolioSummary } from "@/components/investments/PortfolioSummary"
import { HoldingsTable } from "@/components/investments/HoldingsTable"
import { InvestmentForm } from "@/components/investments/InvestmentForm"
import type { Investment } from "@/lib/types"

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Investment | undefined>()

  const fetchInvestments = useCallback(async () => {
    const res = await fetch("/api/investments")
    setInvestments(await res.json())
  }, [])

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investments</h1>
          <p className="text-sm text-muted-foreground">Track your portfolio performance</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Holding
        </Button>
      </div>

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
