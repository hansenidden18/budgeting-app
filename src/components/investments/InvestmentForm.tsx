"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Check, X, Loader2 } from "lucide-react"
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
  const [ticker, setTicker] = useState("")
  const [assetType, setAssetType] = useState<AssetType>("STOCK")
  const [avgBuyPrice, setAvgBuyPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [tickerResult, setTickerResult] = useState<{
    valid: boolean
    price?: number
    currency?: string
    fullName?: string
    exchangeName?: string
    error?: string
  } | null>(null)

  const isPrivate = assetType === "PRIVATE_EQUITY"

  useEffect(() => {
    if (open) {
      setName(investment?.name ?? "")
      setTicker(investment?.ticker ?? "")
      setAssetType((investment?.assetType as AssetType) ?? "STOCK")
      setAvgBuyPrice(investment ? String(investment.avgBuyPrice) : "")
      setCurrentPrice(investment ? String(investment.currentPrice) : "")
      setQuantity(investment?.quantity != null ? String(investment.quantity) : "")
      setNotes(investment?.notes ?? "")
      setTickerResult(null)
    }
  }, [open, investment])

  async function verifyTicker() {
    if (!ticker.trim()) return
    setVerifying(true)
    setTickerResult(null)
    try {
      const res = await fetch("/api/investments/verify-ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.trim() }),
      })
      const data = await res.json()
      setTickerResult(data)
      if (data.valid && data.price) {
        setCurrentPrice(String(data.price))
      }
    } catch {
      setTickerResult({ valid: false, error: "Network error" })
    } finally {
      setVerifying(false)
    }
  }

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
            ticker: isPrivate ? "" : ticker,
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
              <Label htmlFor="inv-name">Name</Label>
              <Input
                id="inv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nvidia or Bitcoin"
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
          {!isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker (for live price refresh)</Label>
              <div className="flex gap-2">
                <Input
                  id="ticker"
                  value={ticker}
                  onChange={(e) => { setTicker(e.target.value.toUpperCase()); setTickerResult(null) }}
                  placeholder="e.g. AAPL, BTC-USD, VTI"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={verifyTicker}
                  disabled={!ticker.trim() || verifying}
                  className="shrink-0"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
              {tickerResult && (
                <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                  tickerResult.valid
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                    : "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30"
                }`}>
                  {tickerResult.valid ? (
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                  )}
                  <div>
                    {tickerResult.valid ? (
                      <>
                        <p className="font-medium">{tickerResult.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          ${tickerResult.price?.toFixed(2)} {tickerResult.currency}
                          {tickerResult.exchangeName ? ` - ${tickerResult.exchangeName}` : ""}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          Current price auto-filled above.
                        </p>
                      </>
                    ) : (
                      <p>{tickerResult.error}</p>
                    )}
                  </div>
                </div>
              )}
              {!tickerResult && (
                <p className="text-xs text-muted-foreground">
                  Optional. Click Verify to check the ticker and auto-fill current price. Crypto: BTC-USD, ETH-USD.
                </p>
              )}
            </div>
          )}
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
