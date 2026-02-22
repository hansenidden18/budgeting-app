import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const categoryId = searchParams.get("categoryId")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  const where: Record<string, unknown> = {}

  if (year && month) {
    const y = parseInt(year)
    const m = parseInt(month)
    where.date = {
      gte: new Date(y, m - 1, 1),
      lt: new Date(y, m, 1),
    }
  } else if (year) {
    const y = parseInt(year)
    where.date = {
      gte: new Date(y, 0, 1),
      lt: new Date(y + 1, 0, 1),
    }
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId)
  }

  if (search) {
    where.description = { contains: search }
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ])

  return NextResponse.json({ expenses, total, page })
}

export async function POST(request: Request) {
  const { date, amount, description, categoryId } = await request.json()
  if (!date || amount === undefined || !description || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const expense = await prisma.expense.create({
    data: {
      date: new Date(date),
      amount: parseFloat(amount),
      description: description.trim(),
      categoryId: parseInt(categoryId),
    },
    include: { category: true },
  })
  return NextResponse.json(expense, { status: 201 })
}
