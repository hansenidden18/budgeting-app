"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList"
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm"
import { formatCurrency } from "@/lib/utils"
import type { Subscription, Category } from "@/lib/types"

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Subscription | undefined>()

  const fetchSubscriptions = useCallback(async () => {
    const res = await fetch("/api/subscriptions")
    setSubscriptions(await res.json())
  }, [])

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories")
    setCategories(await res.json())
  }, [])

  useEffect(() => {
    fetchSubscriptions()
    fetchCategories()
  }, [fetchSubscriptions, fetchCategories])

  const activeMonthly = subscriptions.filter((s) => s.active)
  const monthlyTotal = activeMonthly.reduce((sum, s) => {
    if (s.frequency === "MONTHLY") return sum + s.amount
    if (s.frequency === "YEARLY") return sum + s.amount / 12
    if (s.frequency === "WEEKLY") return sum + s.amount * 4.33
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage recurring expenses</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Subscription
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Cost (est.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {activeMonthly.length} active subscription{activeMonthly.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yearly Cost (est.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthlyTotal * 12)}</p>
          </CardContent>
        </Card>
      </div>

      <SubscriptionList
        subscriptions={subscriptions}
        onEdit={(sub) => setEditing(sub)}
        onRefresh={fetchSubscriptions}
      />

      <SubscriptionForm
        categories={categories}
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchSubscriptions}
      />

      {editing && (
        <SubscriptionForm
          subscription={editing}
          categories={categories}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
          onSuccess={fetchSubscriptions}
        />
      )}
    </div>
  )
}
