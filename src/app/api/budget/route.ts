import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { computeBudgetStatus } from "@/lib/budget"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const now = new Date()
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()))
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1))

  const status = await computeBudgetStatus(year, month)
  if (!status) {
    return NextResponse.json({ hasBudget: false })
  }
  return NextResponse.json(status)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { year, month, amount } = body as {
    year: number
    month: number
    amount: number
  }

  if (amount == null || amount < 0) {
    return NextResponse.json(
      { error: "Amount must be a non-negative number" },
      { status: 400 }
    )
  }

  const budget = await prisma.monthlyBudget.upsert({
    where: { year_month: { year, month } },
    update: { amount },
    create: { year, month, amount },
  })

  return NextResponse.json(budget)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get("year") ?? "")
  const month = parseInt(searchParams.get("month") ?? "")

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json(
      { error: "year and month are required" },
      { status: 400 }
    )
  }

  try {
    await prisma.monthlyBudget.delete({
      where: { year_month: { year, month } },
    })
  } catch {
    return NextResponse.json(
      { error: "Budget not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}
