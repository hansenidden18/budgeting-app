import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  try {
    const inv = await prisma.investment.update({
      where: { id: Number(id) },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.ticker !== undefined && { ticker: body.ticker?.trim() || null }),
        ...(body.assetType && { assetType: body.assetType }),
        ...(body.avgBuyPrice !== undefined && { avgBuyPrice: parseFloat(body.avgBuyPrice) }),
        ...(body.currentPrice !== undefined && { currentPrice: parseFloat(body.currentPrice) }),
        quantity: body.quantity !== undefined && body.quantity !== ""
          ? parseFloat(body.quantity)
          : body.quantity === "" ? null : undefined,
        ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
      },
    })
    const marketValue = inv.quantity !== null ? inv.quantity * inv.currentPrice : inv.currentPrice
    const costBasis = inv.quantity !== null ? inv.quantity * inv.avgBuyPrice : inv.avgBuyPrice
    const gainLossDollar = marketValue - costBasis
    const gainLossPercent = inv.quantity !== null && inv.avgBuyPrice > 0
      ? ((inv.currentPrice - inv.avgBuyPrice) / inv.avgBuyPrice) * 100
      : null
    return NextResponse.json({ ...inv, marketValue, gainLossDollar, gainLossPercent })
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.investment.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
