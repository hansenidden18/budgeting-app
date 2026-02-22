import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { parseCsv } from "@/lib/csv"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const createMissing = searchParams.get("createMissing") === "true"

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCsv(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid rows found in CSV" }, { status: 400 })
  }

  const allCategories = await prisma.category.findMany()
  const categoryMap = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]))

  const unknownCategories = [
    ...new Set(
      rows
        .filter((r) => !categoryMap.has(r.category.toLowerCase()))
        .map((r) => r.category)
    ),
  ]

  if (unknownCategories.length > 0 && createMissing) {
    const colors = ["#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#10b981", "#f97316"]
    for (let i = 0; i < unknownCategories.length; i++) {
      const name = unknownCategories[i]
      const cat = await prisma.category.create({
        data: { name, color: colors[i % colors.length] },
      })
      categoryMap.set(name.toLowerCase(), cat.id)
    }
  }

  let imported = 0
  let skipped = 0

  for (const row of rows) {
    const catId = categoryMap.get(row.category.toLowerCase())
    if (!catId) {
      skipped++
      continue
    }
    await prisma.expense.create({
      data: {
        date: row.date,
        description: row.description,
        amount: row.amount,
        categoryId: catId,
      },
    })
    imported++
  }

  return NextResponse.json({
    imported,
    skipped,
    unknownCategories: createMissing ? [] : unknownCategories,
  })
}
