"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AccountForm } from "@/components/net-worth/AccountForm"
import { formatCurrency } from "@/lib/utils"
import type { Account, Investment } from "@/lib/types"

const TYPE_LABELS: Record<string, string> = {
  CHECKING: "Checking",
  SAVINGS: "Savings",
  CASH: "Cash",
}

const TYPE_COLORS: Record<string, string> = {
  CHECKING: "#3b82f6",
  SAVINGS: "#22c55e",
  CASH: "#f59e0b",
}

export default function NetWorthPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Account | undefined>()

  const fetchAccounts = useCallback(async () => {
    const res = await fetch("/api/accounts")
    setAccounts(await res.json())
  }, [])

  const fetchInvestments = useCallback(async () => {
    const res = await fetch("/api/investments")
    setInvestments(await res.json())
  }, [])

  useEffect(() => {
    fetchAccounts()
    fetchInvestments()
  }, [fetchAccounts, fetchInvestments])

  async function handleDelete(account: Account) {
    if (!confirm(`Delete "${account.name}"?`)) return
    const res = await fetch(`/api/accounts/${account.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Account deleted")
      fetchAccounts()
    } else {
      toast.error("Delete failed")
    }
  }

  const cashTotal = accounts.reduce((sum, a) => sum + a.balance, 0)
  const investmentTotal = investments.reduce((sum, inv) => sum + (inv.marketValue ?? 0), 0)
  const netWorth = cashTotal + investmentTotal

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Net Worth</h1>
          <p className="text-sm text-muted-foreground">Your complete financial picture</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(netWorth)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash & Bank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(cashTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {accounts.length} account{accounts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(investmentTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {investments.length} holding{investments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No accounts yet. Add your bank accounts to track net worth.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: (TYPE_COLORS[account.type] ?? "#9ca3af") + "22",
                          color: TYPE_COLORS[account.type] ?? "#9ca3af",
                          borderColor: (TYPE_COLORS[account.type] ?? "#9ca3af") + "44",
                        }}
                        variant="outline"
                      >
                        {TYPE_LABELS[account.type] ?? account.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {formatCurrency(account.balance)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditing(account)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(account)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AccountForm
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchAccounts}
      />

      {editing && (
        <AccountForm
          account={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
          onSuccess={fetchAccounts}
        />
      )}
    </div>
  )
}
