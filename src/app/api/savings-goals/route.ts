import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(goals)
}

export async function POST(request: Request) {
  const { name, targetAmount, currentAmount, deadline } = await request.json()
  if (!name || targetAmount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const goal = await prisma.savingsGoal.create({
    data: {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : 0,
      deadline: deadline ? new Date(deadline) : null,
    },
  })
  return NextResponse.json(goal, { status: 201 })
}
