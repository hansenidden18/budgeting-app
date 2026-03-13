"use client"

import { useState, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Pencil, Trash2, Repeat, ChevronDown, X } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Expense } from "@/lib/types"

interface ExpenseTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onRefresh: () => void
}

type SortField = "date" | "amount" | "description"
type SortOrder = "asc" | "desc"

export function ExpenseTable({ expenses, onEdit, onRefresh }: ExpenseTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [mounted, setMounted] = useState(false)

  useState(() => { setMounted(true) })

  const ITEMS_PER_PAGE = 15

  const sorted = useMemo(() => {
    if (!sortField) return expenses
    return [...expenses].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number
      if (sortField === "date") {
        aVal = new Date(a.date).getTime()
        bVal = new Date(b.date).getTime()
      } else if (sortField === "amount") {
        aVal = a.amount
        bVal = b.amount
      } else {
        aVal = a.description.toLowerCase()
        bVal = b.description.toLowerCase()
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [expenses, sortField, sortOrder])

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sorted.slice(start, start + ITEMS_PER_PAGE)
  }, [sorted, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setShowSortMenu(false)
    setCurrentPage(1)
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginated.map(e => e.id)))
    }
  }

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

  async function handleBulkDelete() {
    const count = selectedIds.size
    if (!confirm(`Delete ${count} selected expense(s)?`)) return
    let deleted = 0
    for (const id of selectedIds) {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
      if (res.ok) deleted++
    }
    if (deleted > 0) {
      toast.success(`Deleted ${deleted} expense(s)`)
      setSelectedIds(new Set())
      onRefresh()
    }
    if (deleted < count) {
      toast.error(`Failed to delete ${count - deleted} expense(s)`)
    }
  }

  const shouldAnimate = !shouldReduceMotion

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    }
  }

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 16,
      scale: 0.98,
      filter: "blur(3px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
  }

  if (expenses.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No expenses found. Add one or adjust the filters.
      </p>
    )
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 transition-colors font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete {selectedIds.size} selected
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sort {sortField && <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">1</span>}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button onClick={() => handleSort("date")} className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${sortField === "date" ? "bg-muted/30" : ""}`}>
                    Date {sortField === "date" && `(${sortOrder === "asc" ? "oldest" : "newest"})`}
                  </button>
                  <button onClick={() => handleSort("amount")} className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${sortField === "amount" ? "bg-muted/30" : ""}`}>
                    Amount {sortField === "amount" && `(${sortOrder === "asc" ? "low" : "high"})`}
                  </button>
                  <button onClick={() => handleSort("description")} className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${sortField === "description" ? "bg-muted/30" : ""}`}>
                    Description {sortField === "description" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background border border-border/50 overflow-hidden rounded-lg relative">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header */}
            <div
              className="px-3 py-3 text-xs font-medium text-muted-foreground/60 bg-muted/5 border-b border-border/30 text-left"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 120px 1fr 160px 140px 60px",
                alignItems: "center",
              }}
            >
              <div className="flex items-center justify-center border-r border-border/20 pr-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border/40 cursor-pointer"
                  style={mounted ? { accentColor: isDark ? "rgb(113, 113, 122)" : "rgb(161, 161, 170)" } : {}}
                  checked={paginated.length > 0 && selectedIds.size === paginated.length}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="flex items-center gap-1.5 border-r border-border/20 px-3">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40">
                  <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M2 6H14M6 3V13" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Date</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border/20 px-3">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40">
                  <path d="M3 3H13M3 8H13M3 13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Description</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border/20 px-3">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40">
                  <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Category</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border/20 px-3">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40">
                  <path d="M8 3V13M5 6L8 3L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Amount</span>
              </div>
              <div className="flex items-center justify-center px-3">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-30">
                  <circle cx="8" cy="8" r="1" fill="currentColor"/>
                  <circle cx="13" cy="8" r="1" fill="currentColor"/>
                  <circle cx="3" cy="8" r="1" fill="currentColor"/>
                </svg>
              </div>
            </div>

            {/* Rows */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginated.map((expense) => (
                  <motion.div key={expense.id} variants={shouldAnimate ? rowVariants : {}}>
                    <div
                      className={`px-3 py-3 group relative transition-all duration-150 border-b border-border/20 ${
                        selectedIds.has(expense.id)
                          ? "bg-muted/30"
                          : "bg-muted/5 hover:bg-muted/20"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 120px 1fr 160px 140px 60px",
                        alignItems: "center",
                      }}
                    >
                      {/* Checkbox */}
                      <div className="flex items-center justify-center border-r border-border/20 pr-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border/40 cursor-pointer"
                          style={mounted ? { accentColor: isDark ? "rgb(113, 113, 122)" : "rgb(161, 161, 170)" } : {}}
                          checked={selectedIds.has(expense.id)}
                          onChange={() => toggleSelect(expense.id)}
                        />
                      </div>

                      {/* Date */}
                      <div className="flex items-center border-r border-border/20 px-3">
                        <span className="text-sm text-muted-foreground">{formatDate(expense.date)}</span>
                      </div>

                      {/* Description */}
                      <div className="flex items-center gap-2 min-w-0 border-r border-border/20 px-3">
                        <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted/30 rounded-full min-w-0">
                          <span className="text-sm text-foreground truncate">{expense.description}</span>
                          {expense.subscriptionId && (
                            <span title="Recurring subscription"><Repeat className="h-3 w-3 text-muted-foreground shrink-0" /></span>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center border-r border-border/20 px-3">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md"
                          style={{
                            backgroundColor: expense.category.color + "18",
                            color: expense.category.color,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: expense.category.color }}
                          />
                          {expense.category.name}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center border-r border-border/20 px-3">
                        <span className={`text-sm font-mono ${expense.amount < 0 ? "text-green-500" : "text-foreground/80"}`}>
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-1 px-3">
                        <button
                          onClick={() => onEdit(expense)}
                          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity cursor-pointer p-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense)}
                          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity cursor-pointer p-1 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Detail overlay */}
        <AnimatePresence>
          {detailExpense && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10"
              onClick={() => setDetailExpense(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
                className="bg-card border border-border rounded-xl p-6 mx-6 shadow-lg relative max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setDetailExpense(null)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted/50 hover:bg-muted/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
                <h3 className="text-lg font-semibold">{detailExpense.description}</h3>
                <p className="text-2xl font-bold mt-2">{formatCurrency(detailExpense.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(detailExpense.date)}</p>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md mt-3"
                  style={{
                    backgroundColor: detailExpense.category.color + "18",
                    color: detailExpense.category.color,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: detailExpense.category.color }} />
                  {detailExpense.category.name}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70">
            Page {currentPage} of {totalPages} - {sorted.length} expenses
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
