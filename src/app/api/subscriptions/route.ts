import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const subscriptions = await prisma.subscription.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(subscriptions)
}

export async function POST(request: Request) {
  const { name, amount, categoryId, frequency, dayOfMonth, startDate, endDate } = await request.json()
  if (!name || amount === undefined || !categoryId || !frequency || !startDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const subscription = await prisma.subscription.create({
    data: {
      name: name.trim(),
      amount: parseFloat(amount),
      categoryId: Number(categoryId),
      frequency,
      dayOfMonth: dayOfMonth ? Number(dayOfMonth) : 1,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
    include: { category: true },
  })
  return NextResponse.json(subscription, { status: 201 })
}
