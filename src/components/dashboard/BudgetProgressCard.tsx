"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Wallet, Settings, ArrowRightLeft } from "lucide-react"
import type { BudgetStatus } from "@/lib/types"

interface BudgetProgressCardProps {
  budgetStatus: BudgetStatus | null
  onSetBudget: () => void
}

export function BudgetProgressCard({
  budgetStatus,
  onSetBudget,
}: BudgetProgressCardProps) {
  if (!budgetStatus || !budgetStatus.hasBudget) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Set a monthly budget to track your spending
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onSetBudget}>
            Set Budget
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { spent, effectiveLimit, percentUsed, remaining, rolloverAmount, isOverBudget, isDefault } = budgetStatus
  const clampedPercent = Math.min(percentUsed, 100)

  let barColor = "bg-emerald-500"
  if (isOverBudget) barColor = "bg-red-500"
  else if (percentUsed >= 85) barColor = "bg-red-500"
  else if (percentUsed >= 60) barColor = "bg-amber-500"

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Monthly Budget</h3>
            {isDefault && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                Default
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onSetBudget}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="font-mono font-medium">
            {formatCurrency(spent)}
          </span>
          <span className="text-muted-foreground">
            of {formatCurrency(effectiveLimit)}
          </span>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{percentUsed.toFixed(0)}% used</span>
          {isOverBudget ? (
            <span className="text-red-500 font-medium">
              {formatCurrency(Math.abs(remaining))} over budget
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">
              {formatCurrency(remaining)} remaining
            </span>
          )}
        </div>

        {rolloverAmount !== 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <ArrowRightLeft className="h-3 w-3" />
            {rolloverAmount > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(rolloverAmount)} rollover from previous months
              </span>
            ) : (
              <span className="text-red-500">
                -{formatCurrency(Math.abs(rolloverAmount))} carried over from overspending
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
