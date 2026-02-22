import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { date, amount, description, categoryId } = await request.json()
  try {
    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: {
        ...(date && { date: new Date(date) }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description && { description: description.trim() }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
      },
      include: { category: true },
    })
    return NextResponse.json(expense)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.expense.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
