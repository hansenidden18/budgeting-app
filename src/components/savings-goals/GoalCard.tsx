"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { SavingsGoal } from "@/lib/types"

interface GoalCardProps {
  goal: SavingsGoal
  onEdit: (goal: SavingsGoal) => void
  onDelete: (goal: SavingsGoal) => void
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const percent = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0
  const remaining = goal.targetAmount - goal.currentAmount

  let barColor = "bg-red-500"
  if (percent >= 75) barColor = "bg-emerald-500"
  else if (percent >= 25) barColor = "bg-amber-500"

  let daysLeft: number | null = null
  if (goal.deadline) {
    const diff = new Date(goal.deadline).getTime() - Date.now()
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{goal.name}</h3>
            {daysLeft !== null && (
              <p className="text-xs text-muted-foreground">
                {daysLeft === 0 ? "Deadline reached" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(goal)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(goal)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="font-mono font-medium">{formatCurrency(goal.currentAmount)}</span>
          <span className="text-muted-foreground">of {formatCurrency(goal.targetAmount)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{percent.toFixed(0)}% complete</span>
          {remaining > 0 && <span>{formatCurrency(remaining)} to go</span>}
          {remaining <= 0 && <span className="text-emerald-600 dark:text-emerald-400 font-medium">Goal reached!</span>}
        </div>
      </CardContent>
    </Card>
  )
}
