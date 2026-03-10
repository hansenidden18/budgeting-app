import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  try {
    const goal = await prisma.savingsGoal.update({
      where: { id: Number(id) },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.targetAmount !== undefined && { targetAmount: parseFloat(body.targetAmount) }),
        ...(body.currentAmount !== undefined && { currentAmount: parseFloat(body.currentAmount) }),
        ...(body.deadline !== undefined && { deadline: body.deadline ? new Date(body.deadline) : null }),
      },
    })
    return NextResponse.json(goal)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.savingsGoal.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
