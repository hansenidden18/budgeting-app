"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { GoalCard } from "@/components/savings-goals/GoalCard"
import { GoalForm } from "@/components/savings-goals/GoalForm"
import { formatCurrency } from "@/lib/utils"
import type { SavingsGoal } from "@/lib/types"

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | undefined>()

  const fetchGoals = useCallback(async () => {
    const res = await fetch("/api/savings-goals")
    setGoals(await res.json())
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  async function handleDelete(goal: SavingsGoal) {
    if (!confirm(`Delete "${goal.name}"?`)) return
    const res = await fetch(`/api/savings-goals/${goal.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Goal deleted")
      fetchGoals()
    } else {
      toast.error("Delete failed")
    }
  }

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Savings Goals</h1>
          <p className="text-sm text-muted-foreground">
            {goals.length > 0
              ? `${formatCurrency(totalSaved)} saved of ${formatCurrency(totalTarget)} total`
              : "Track progress toward your financial goals"
            }
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No goals yet. Create your first savings goal to start tracking.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => setEditing(g)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <GoalForm
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchGoals}
      />

      {editing && (
        <GoalForm
          goal={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
          onSuccess={fetchGoals}
        />
      )}
    </div>
  )
}
