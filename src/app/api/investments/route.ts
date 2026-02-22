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
  const { name, assetType, avgBuyPrice, currentPrice, quantity, notes } = await request.json()
  if (!name || !assetType || avgBuyPrice === undefined || currentPrice === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const inv = await prisma.investment.create({
    data: {
      name: name.trim(),
      assetType,
      avgBuyPrice: parseFloat(avgBuyPrice),
      currentPrice: parseFloat(currentPrice),
      quantity: quantity !== undefined && quantity !== "" ? parseFloat(quantity) : null,
      notes: notes?.trim() || null,
    },
  })
  return NextResponse.json({ ...inv, ...computeFields(inv) }, { status: 201 })
}
