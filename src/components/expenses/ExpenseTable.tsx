"use client"

import { Pencil, Trash2, Repeat } from "lucide-react"
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
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Expense } from "@/lib/types"

interface ExpenseTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onRefresh: () => void
}

export function ExpenseTable({ expenses, onEdit, onRefresh }: ExpenseTableProps) {
  async function handleDelete(expense: Expense) {
    if (!confirm(`Delete "${expense.description}"?`)) return
    const res = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Expense deleted")
      onRefresh()
    } else {
      toast.error("Delete failed")
    }
  }

  if (expenses.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No expenses found. Add one or adjust the filters.
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(expense.date)}
              </TableCell>
              <TableCell className="font-medium">
                {expense.description}
                {expense.subscriptionId && (
                  <span title="Recurring subscription">
                    <Repeat className="ml-1.5 inline h-3 w-3 text-muted-foreground" />
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  style={{
                    backgroundColor: expense.category.color + "22",
                    color: expense.category.color,
                    borderColor: expense.category.color + "44",
                  }}
                  variant="outline"
                >
                  {expense.category.name}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                <span className={expense.amount < 0 ? "text-green-600 dark:text-green-400" : ""}>
                  {formatCurrency(expense.amount)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(expense)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(expense)}
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
