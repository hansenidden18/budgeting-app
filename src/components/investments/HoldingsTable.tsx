"use client"

import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Investment } from "@/lib/types"
import { ASSET_TYPE_LABELS } from "@/lib/types"

const ASSET_COLORS: Record<string, string> = {
  STOCK: "#3b82f6",
  CRYPTO: "#f59e0b",
  ETF: "#22c55e",
  BOND: "#6366f1",
  PRIVATE_EQUITY: "#ec4899",
  OTHER: "#9ca3af",
}

interface HoldingsTableProps {
  investments: Investment[]
  onEdit: (inv: Investment) => void
  onRefresh: () => void
}

export function HoldingsTable({ investments, onEdit, onRefresh }: HoldingsTableProps) {
  async function handleDelete(inv: Investment) {
    if (!confirm(`Delete "${inv.name}"?`)) return
    const res = await fetch(`/api/investments/${inv.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Holding deleted")
      onRefresh()
    } else {
      toast.error("Delete failed")
    }
  }

  if (investments.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No holdings yet. Add your first investment.
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Avg Buy</TableHead>
            <TableHead className="text-right">Current</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">Gain/Loss</TableHead>
            <TableHead className="text-right">Return %</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((inv) => {
            const pct = inv.gainLossPercent
            const gl = inv.gainLossDollar ?? 0
            return (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.name}</TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: (ASSET_COLORS[inv.assetType] ?? "#9ca3af") + "22",
                      color: ASSET_COLORS[inv.assetType] ?? "#9ca3af",
                      borderColor: (ASSET_COLORS[inv.assetType] ?? "#9ca3af") + "44",
                    }}
                    variant="outline"
                  >
                    {ASSET_TYPE_LABELS[inv.assetType as keyof typeof ASSET_TYPE_LABELS]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(inv.avgBuyPrice)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(inv.currentPrice)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {inv.quantity != null ? inv.quantity : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-medium">
                  {formatCurrency(inv.marketValue ?? 0)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm ${gl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {gl >= 0 ? "+" : ""}{formatCurrency(gl)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm ${pct == null ? "text-muted-foreground" : pct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {pct == null ? "N/A" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEdit(inv)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(inv)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
