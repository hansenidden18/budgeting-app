import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateCsv } from "@/lib/csv"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const categoryId = searchParams.get("categoryId")

  const where: Record<string, unknown> = {}

  if (year && month) {
    const y = parseInt(year)
    const m = parseInt(month)
    where.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) }
  } else if (year) {
    const y = parseInt(year)
    where.date = { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) }
  }

  if (categoryId) where.categoryId = parseInt(categoryId)

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  })

  const csv = generateCsv(expenses)
  const filename = year && month ? `expenses-${year}-${month.padStart(2, "0")}.csv` : "expenses.csv"

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
