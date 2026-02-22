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
import type { Investment, AssetType } from "@/lib/types"
import { ASSET_TYPE_LABELS } from "@/lib/types"

const ASSET_TYPES: AssetType[] = ["STOCK", "CRYPTO", "ETF", "BOND", "PRIVATE_EQUITY", "OTHER"]

interface InvestmentFormProps {
  investment?: Investment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function InvestmentForm({ investment, open, onOpenChange, onSuccess }: InvestmentFormProps) {
  const isEdit = !!investment
  const [name, setName] = useState("")
  const [assetType, setAssetType] = useState<AssetType>("STOCK")
  const [avgBuyPrice, setAvgBuyPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const isPrivate = assetType === "PRIVATE_EQUITY"

  useEffect(() => {
    if (open) {
      setName(investment?.name ?? "")
      setAssetType((investment?.assetType as AssetType) ?? "STOCK")
      setAvgBuyPrice(investment ? String(investment.avgBuyPrice) : "")
      setCurrentPrice(investment ? String(investment.currentPrice) : "")
      setQuantity(investment?.quantity != null ? String(investment.quantity) : "")
      setNotes(investment?.notes ?? "")
    }
  }, [open, investment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(
        isEdit ? `/api/investments/${investment.id}` : "/api/investments",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            assetType,
            avgBuyPrice: parseFloat(avgBuyPrice),
            currentPrice: parseFloat(currentPrice),
            quantity: isPrivate ? "" : quantity,
            notes,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong")
      } else {
        toast.success(isEdit ? "Investment updated" : "Investment added")
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
          <DialogTitle>{isEdit ? "Edit Holding" : "Add Holding"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-name">Ticker / Name</Label>
              <Input
                id="inv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NVDA or Bitcoin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{ASSET_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avg-buy">
                {isPrivate ? "Original Value ($)" : "Avg Buy Price ($)"}
              </Label>
              <Input
                id="avg-buy"
                type="number"
                step="0.0001"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-price">
                {isPrivate ? "Current Value ($)" : "Current Price ($)"}
              </Label>
              <Input
                id="current-price"
                type="number"
                step="0.0001"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          {!isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity (optional)</Label>
              <Input
                id="qty"
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Leave blank if not tracking units"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Held in Robinhood"
            />
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
