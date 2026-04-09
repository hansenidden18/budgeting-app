"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { BudgetStatus } from "@/lib/types"

interface BudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: number
  month: number
  currentBudget: BudgetStatus | null
  onSave: () => void
}

const monthLabels = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function BudgetDialog({
  open,
  onOpenChange,
  year,
  month,
  currentBudget,
  onSave,
}: BudgetDialogProps) {
  const [amount, setAmount] = useState("")
  const [setAsDefault, setSetAsDefault] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasExplicitBudget, setHasExplicitBudget] = useState(false)

  useEffect(() => {
    if (open) {
      // Prefill from current budget
      if (currentBudget?.hasBudget) {
        setAmount(String(currentBudget.baseLimit))
        setHasExplicitBudget(!currentBudget.isDefault)
      } else {
        setAmount("")
        setHasExplicitBudget(false)
      }
      setSetAsDefault(false)
    }
  }, [open, currentBudget])

  async function handleSave() {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Enter a valid budget amount")
      return
    }

    setSaving(true)
    try {
      // Save month-specific budget
      await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, amount: parsed }),
      })

      // Also set as default if checked
      if (setAsDefault) {
        await fetch("/api/budget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year: 0, month: 0, amount: parsed }),
        })
      }

      toast.success("Budget saved")
      onOpenChange(false)
      onSave()
    } catch {
      toast.error("Failed to save budget")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveOverride() {
    setSaving(true)
    try {
      await fetch(`/api/budget?year=${year}&month=${month}`, {
        method: "DELETE",
      })
      toast.success("Override removed, using default budget")
      onOpenChange(false)
      onSave()
    } catch {
      toast.error("Failed to remove override")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
          <DialogDescription>
            Budget for {monthLabels[month]} {year}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Monthly limit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                step="100"
                placeholder="3000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border/40 cursor-pointer"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
            />
            <span className="text-sm">Also set as default for all months</span>
          </label>
        </div>

        <DialogFooter>
          {hasExplicitBudget && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveOverride}
              disabled={saving}
              className="mr-auto text-muted-foreground"
            >
              Remove Override
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
