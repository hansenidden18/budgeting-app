"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDateInput, parseLocalDate } from "@/lib/utils"
import type { Subscription, SubscriptionFrequency, Category } from "@/lib/types"

const FREQUENCIES: { value: SubscriptionFrequency; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "WEEKLY", label: "Weekly" },
]

interface SubscriptionFormProps {
  subscription?: Subscription
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SubscriptionForm({ subscription, categories, open, onOpenChange, onSuccess }: SubscriptionFormProps) {
  const isEdit = !!subscription
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("MONTHLY")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(subscription?.name ?? "")
      setAmount(subscription ? String(subscription.amount) : "")
      setCategoryId(subscription ? String(subscription.categoryId) : categories[0] ? String(categories[0].id) : "")
      setFrequency((subscription?.frequency as SubscriptionFrequency) ?? "MONTHLY")
      setDayOfMonth(subscription ? String(subscription.dayOfMonth) : "1")
      setStartDate(subscription ? formatDateInput(subscription.startDate) : formatDateInput(new Date().toISOString()))
      setEndDate(subscription?.endDate ? formatDateInput(subscription.endDate) : "")
    }
  }, [open, subscription, categories])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(
        isEdit ? `/api/subscriptions/${subscription.id}` : "/api/subscriptions",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            amount: parseFloat(amount),
            categoryId: Number(categoryId),
            frequency,
            dayOfMonth: Number(dayOfMonth),
            startDate: parseLocalDate(startDate).toISOString(),
            endDate: endDate ? parseLocalDate(endDate).toISOString() : null,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong")
      } else {
        toast.success(isEdit ? "Subscription updated" : "Subscription added")
        onOpenChange(false)
        onSuccess()
      }
    } catch {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-name">Name</Label>
              <Input
                id="sub-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Netflix, Spotify"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-amount">Amount ($)</Label>
              <Input
                id="sub-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as SubscriptionFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {frequency !== "WEEKLY" && (
            <div className="space-y-2">
              <Label htmlFor="day-of-month">Day of Month</Label>
              <Input
                id="day-of-month"
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Clamped to last day for short months (e.g. 31 becomes 28 in Feb).
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date (optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
