"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpenseTable } from "@/components/expenses/ExpenseTable"
import { ExpenseForm } from "@/components/expenses/ExpenseForm"
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters"
import { ImportCsvDialog } from "@/components/expenses/ImportCsvDialog"
import { ExportCsvButton } from "@/components/expenses/ExportCsvButton"
import { formatCurrency } from "@/lib/utils"
import type { Expense, Category } from "@/lib/types"

export default function ExpensesPage() {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Expense | undefined>()
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [search, setSearch] = useState("")

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories")
    setCategories(await res.json())
  }, [])

  // Fetch all expenses for year/month/search - no category filter on API
  const fetchExpenses = useCallback(async () => {
    const params = new URLSearchParams()
    if (year) params.set("year", year)
    if (month && month !== "0") params.set("month", month)
    if (search) params.set("search", search)
    params.set("limit", "500")

    const res = await fetch(`/api/expenses?${params.toString()}`)
    const data = await res.json()
    setAllExpenses(data.expenses ?? [])
    setTotal(data.total ?? 0)
  }, [year, month, search])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    const m = month && month !== "0" ? month : String(now.getMonth() + 1)
    const y = year || String(now.getFullYear())
    fetch("/api/subscriptions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: Number(y), month: Number(m) }),
    }).then(() => fetchExpenses())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, search])

  // Client-side category filter - instant, no API call
  const expenses = useMemo(() => {
    if (selectedCategoryIds.length === 0) return allExpenses
    const idSet = new Set(selectedCategoryIds.map(Number))
    return allExpenses.filter((e) => idSet.has(e.categoryId))
  }, [allExpenses, selectedCategoryIds])

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {expenses.length} record(s) - Total: <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <ExportCsvButton month={month} year={year} categoryId="0" />
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      <ExpenseFilters
        month={month}
        year={year}
        selectedCategoryIds={selectedCategoryIds}
        search={search}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onCategoryChange={setSelectedCategoryIds}
        onSearchChange={setSearch}
        categories={categories}
      />

      <ExpenseTable
        expenses={expenses}
        onEdit={(e) => setEditing(e)}
        onRefresh={fetchExpenses}
      />

      <ExpenseForm
        categories={categories}
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchExpenses}
      />

      {editing && (
        <ExpenseForm
          expense={editing}
          categories={categories}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
          onSuccess={fetchExpenses}
        />
      )}

      <ImportCsvDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSuccess={fetchExpenses}
      />
    </div>
  )
}
