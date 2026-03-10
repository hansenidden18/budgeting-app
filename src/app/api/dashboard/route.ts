import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const now = new Date()
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()))
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1))

  const categories = await prisma.category.findMany()
  const catMap = new Map(categories.map((c) => [c.id, c]))

  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year + 1, 0, 1)
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 1)

  const twelveMonthsAgo = new Date(year, month - 13, 1)

  const allExpenses = await prisma.expense.findMany({
    where: { date: { gte: twelveMonthsAgo, lt: endOfMonth } },
    include: { category: true },
    orderBy: { date: "asc" },
  })

  const monthlyMap = new Map<string, Map<string, number>>()
  const monthlyTotals = new Map<string, number>()

  for (const e of allExpenses) {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyMap.has(key)) monthlyMap.set(key, new Map())
    const catGroup = monthlyMap.get(key)!
    const catName = e.category.name
    catGroup.set(catName, (catGroup.get(catName) ?? 0) + e.amount)
    monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + e.amount)
  }

  const sortedMonthKeys = [...monthlyMap.keys()].sort()
  const allCatNames = [...new Set(allExpenses.map((e) => e.category.name))]

  const monthlyByCategory = sortedMonthKeys.map((key) => {
    const row: Record<string, number | string> = { month: key }
    const catData = monthlyMap.get(key)!
    for (const name of allCatNames) {
      row[name] = catData.get(name) ?? 0
    }
    return row
  })

  const monthlyTotalsArr = sortedMonthKeys.map((key) => ({
    month: key,
    total: monthlyTotals.get(key) ?? 0,
  }))

  const periodExpenses = allExpenses.filter((e) => {
    const d = new Date(e.date)
    return d >= startOfMonth && d < endOfMonth
  })

  const periodCatMap = new Map<string, { value: number; color: string }>()
  for (const e of periodExpenses) {
    const existing = periodCatMap.get(e.category.name)
    periodCatMap.set(e.category.name, {
      value: (existing?.value ?? 0) + e.amount,
      color: e.category.color,
    })
  }

  const periodByCategory = [...periodCatMap.entries()]
    .filter(([, v]) => v.value > 0)
    .map(([name, { value, color }]) => ({ name, value, color }))
    .sort((a, b) => b.value - a.value)

  const ytdExpenses = allExpenses.filter((e) => {
    const d = new Date(e.date)
    return d >= startOfYear && d < endOfYear
  })

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const ytdData: Record<string, Record<string, number>> = {}
  const ytdColors: Record<string, string> = {}

  for (const e of ytdExpenses) {
    const d = new Date(e.date)
    const mName = monthNames[d.getMonth()]
    const catName = e.category.name
    if (!ytdData[catName]) ytdData[catName] = {}
    ytdData[catName][mName] = (ytdData[catName][mName] ?? 0) + e.amount
    ytdColors[catName] = e.category.color
  }

  const selectedMonthTotal = periodExpenses
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0)

  // Previous month comparison
  const prevMonthStart = new Date(year, month - 2, 1)
  const prevMonthEnd = new Date(year, month - 1, 1)
  const prevExpenses = allExpenses.filter((e) => {
    const d = new Date(e.date)
    return d >= prevMonthStart && d < prevMonthEnd
  })
  const previousMonthTotal = prevExpenses
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0)
  const monthOverMonthChange =
    previousMonthTotal > 0
      ? ((selectedMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : null

  // Category insights: per-category month-over-month
  const prevCatTotals = new Map<string, number>()
  for (const e of prevExpenses.filter((e) => e.amount > 0)) {
    prevCatTotals.set(e.category.name, (prevCatTotals.get(e.category.name) ?? 0) + e.amount)
  }
  const currCatTotals = new Map<string, number>()
  for (const e of periodExpenses.filter((e) => e.amount > 0)) {
    currCatTotals.set(e.category.name, (currCatTotals.get(e.category.name) ?? 0) + e.amount)
  }
  const allInsightCats = new Set([...prevCatTotals.keys(), ...currCatTotals.keys()])
  const insights = [...allInsightCats]
    .map((name) => {
      const current = currCatTotals.get(name) ?? 0
      const previous = prevCatTotals.get(name) ?? 0
      const changeDollar = current - previous
      const changePercent = previous > 0 ? (changeDollar / previous) * 100 : current > 0 ? 100 : 0
      return { name, current, previous, changePercent, changeDollar }
    })
    .filter((i) => Math.abs(i.changePercent) > 10 && Math.abs(i.changeDollar) > 20)
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))

  const ytdTotal = ytdExpenses
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0)

  const catTotals = new Map<string, number>()
  for (const e of periodExpenses.filter((e) => e.amount > 0)) {
    catTotals.set(e.category.name, (catTotals.get(e.category.name) ?? 0) + e.amount)
  }

  let largestCategory: { name: string; amount: number } | null = null
  for (const [name, amount] of catTotals) {
    if (!largestCategory || amount > largestCategory.amount) {
      largestCategory = { name, amount }
    }
  }

  const activeMonths = monthNames.filter((_, i) => {
    const d = new Date(year, i, 1)
    return d <= now && d >= startOfYear
  })

  return NextResponse.json({
    monthlyByCategory,
    periodByCategory,
    monthlyTotals: monthlyTotalsArr,
    ytdTable: {
      categories: Object.keys(ytdData),
      months: activeMonths,
      data: ytdData,
      colors: ytdColors,
    },
    selectedMonthTotal,
    previousMonthTotal,
    monthOverMonthChange,
    ytdTotal,
    largestCategory,
    categoryNames: allCatNames,
    categoryColors: Object.fromEntries(categories.map((c) => [c.name, c.color])),
    insights,
  })
}
