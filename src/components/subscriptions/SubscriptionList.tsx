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
import type { Subscription } from "@/lib/types"

const FREQ_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  WEEKLY: "Weekly",
}

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit: (sub: Subscription) => void
  onRefresh: () => void
}

export function SubscriptionList({ subscriptions, onEdit, onRefresh }: SubscriptionListProps) {
  async function handleDelete(sub: Subscription) {
    if (!confirm(`Delete "${sub.name}"? Generated expenses will be kept.`)) return
    const res = await fetch(`/api/subscriptions/${sub.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Subscription deleted")
      onRefresh()
    } else {
      toast.error("Delete failed")
    }
  }

  async function handleToggle(sub: Subscription) {
    const res = await fetch(`/api/subscriptions/${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !sub.active }),
    })
    if (res.ok) {
      toast.success(sub.active ? "Subscription paused" : "Subscription activated")
      onRefresh()
    } else {
      toast.error("Update failed")
    }
  }

  if (subscriptions.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No subscriptions yet. Add your first recurring expense.
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Day</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id} className={!sub.active ? "opacity-50" : ""}>
              <TableCell className="font-medium">{sub.name}</TableCell>
              <TableCell>
                <Badge
                  style={{
                    backgroundColor: sub.category.color + "22",
                    color: sub.category.color,
                    borderColor: sub.category.color + "44",
                  }}
                  variant="outline"
                >
                  {sub.category.name}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatCurrency(sub.amount)}
              </TableCell>
              <TableCell className="text-sm">{FREQ_LABELS[sub.frequency] ?? sub.frequency}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {sub.frequency === "WEEKLY" ? "-" : sub.dayOfMonth}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleToggle(sub)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    sub.active
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {sub.active ? "Active" : "Paused"}
                </button>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(sub)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(sub)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
