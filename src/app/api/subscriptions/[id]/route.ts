import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  try {
    const subscription = await prisma.subscription.update({
      where: { id: Number(id) },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
        ...(body.categoryId !== undefined && { categoryId: Number(body.categoryId) }),
        ...(body.frequency && { frequency: body.frequency }),
        ...(body.dayOfMonth !== undefined && { dayOfMonth: Number(body.dayOfMonth) }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.active !== undefined && { active: body.active }),
      },
      include: { category: true },
    })
    return NextResponse.json(subscription)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Unlink generated expenses but keep them
  await prisma.expense.updateMany({
    where: { subscriptionId: Number(id) },
    data: { subscriptionId: null },
  })
  await prisma.subscription.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
