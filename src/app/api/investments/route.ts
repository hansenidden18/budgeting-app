import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

function computeFields(inv: {
  avgBuyPrice: number
  currentPrice: number
  quantity: number | null
}) {
  const marketValue = inv.quantity !== null
    ? inv.quantity * inv.currentPrice
    : inv.currentPrice

  const costBasis = inv.quantity !== null
    ? inv.quantity * inv.avgBuyPrice
    : inv.avgBuyPrice

  const gainLossDollar = marketValue - costBasis

  const gainLossPercent = inv.quantity !== null && inv.avgBuyPrice > 0
    ? ((inv.currentPrice - inv.avgBuyPrice) / inv.avgBuyPrice) * 100
    : null

  return { marketValue, gainLossDollar, gainLossPercent }
}

export async function GET() {
  const investments = await prisma.investment.findMany({
    orderBy: { createdAt: "asc" },
  })
  const result = investments.map((inv) => ({
    ...inv,
    ...computeFields(inv),
  }))
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const { name, assetType, avgBuyPrice, currentPrice, quantity, notes, ticker } = await request.json()
  if (!name || !assetType || avgBuyPrice === undefined || currentPrice === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const trimmedName = name.trim()
  const trimmedTicker = ticker?.trim() || null
  const parsedQty = quantity !== undefined && quantity !== "" ? parseFloat(quantity) : null
  const parsedAvgBuy = parseFloat(avgBuyPrice)
  const parsedCurrent = parseFloat(currentPrice)

  // Check for existing holding to merge with (match by ticker first, then name)
  const allInvestments = await prisma.investment.findMany()
  const existing = allInvestments.find((inv) =>
    (trimmedTicker && inv.ticker?.toLowerCase() === trimmedTicker.toLowerCase()) ||
    inv.name.toLowerCase() === trimmedName.toLowerCase()
  )

  if (existing) {
    const bothHaveQty = existing.quantity !== null && parsedQty !== null
    const neitherHasQty = existing.quantity === null && parsedQty === null

    if (bothHaveQty) {
      // Merge: sum quantities, weighted average buy price, latest current price
      const existingQty = existing.quantity!
      const totalQty = existingQty + parsedQty
      const weightedAvg = totalQty > 0
        ? (existingQty * existing.avgBuyPrice + parsedQty * parsedAvgBuy) / totalQty
        : parsedAvgBuy

      const inv = await prisma.investment.update({
        where: { id: existing.id },
        data: {
          quantity: totalQty,
          avgBuyPrice: weightedAvg,
          currentPrice: parsedCurrent,
          notes: notes?.trim() || existing.notes,
        },
      })
      return NextResponse.json({ ...inv, ...computeFields(inv), merged: true })
    }

    if (neitherHasQty) {
      // Private equity / single-value: sum cost basis and current values
      const inv = await prisma.investment.update({
        where: { id: existing.id },
        data: {
          avgBuyPrice: existing.avgBuyPrice + parsedAvgBuy,
          currentPrice: existing.currentPrice + parsedCurrent,
          notes: notes?.trim() || existing.notes,
        },
      })
      return NextResponse.json({ ...inv, ...computeFields(inv), merged: true })
    }

    // Mixed (one has qty, other doesn't) - incompatible, create separate entry
  }

  const inv = await prisma.investment.create({
    data: {
      name: trimmedName,
      ticker: trimmedTicker,
      assetType,
      avgBuyPrice: parsedAvgBuy,
      currentPrice: parsedCurrent,
      quantity: parsedQty,
      notes: notes?.trim() || null,
    },
  })
  return NextResponse.json({ ...inv, ...computeFields(inv) }, { status: 201 })
}
