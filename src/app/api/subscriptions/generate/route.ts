import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

function clampDay(year: number, month: number, day: number): number {
  const lastDay = new Date(year, month, 0).getDate()
  return Math.min(day, lastDay)
}

export async function POST(request: Request) {
  const { year, month } = await request.json()
  if (!year || !month) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 })
  }

  const y = Number(year)
  const m = Number(month)
  const startOfMonth = new Date(y, m - 1, 1)
  const endOfMonth = new Date(y, m, 1)

  const subscriptions = await prisma.subscription.findMany({
    where: {
      active: true,
      startDate: { lt: endOfMonth },
      OR: [
        { endDate: null },
        { endDate: { gte: startOfMonth } },
      ],
    },
  })

  let generated = 0
  let skipped = 0

  for (const sub of subscriptions) {
    const subStart = new Date(sub.startDate)

    if (sub.frequency === "YEARLY") {
      // Only generate in the month matching the start date's month
      if (subStart.getMonth() !== m - 1) {
        skipped++
        continue
      }
    }

    if (sub.frequency === "WEEKLY") {
      // Generate one expense per week in the month
      const dayOfWeek = subStart.getDay()
      let current = new Date(y, m - 1, 1)
      // Find first occurrence of that weekday
      while (current.getDay() !== dayOfWeek) {
        current.setDate(current.getDate() + 1)
      }
      while (current < endOfMonth) {
        const existing = await prisma.expense.findFirst({
          where: {
            subscriptionId: sub.id,
            date: current,
          },
        })
        if (!existing) {
          await prisma.expense.create({
            data: {
              date: current,
              description: sub.name,
              amount: sub.amount,
              categoryId: sub.categoryId,
              subscriptionId: sub.id,
            },
          })
          generated++
        } else {
          skipped++
        }
        current = new Date(current)
        current.setDate(current.getDate() + 7)
      }
      continue
    }

    // MONTHLY or YEARLY - single expense
    const day = clampDay(y, m, sub.dayOfMonth)
    const expenseDate = new Date(y, m - 1, day)

    const existing = await prisma.expense.findFirst({
      where: {
        subscriptionId: sub.id,
        date: { gte: startOfMonth, lt: endOfMonth },
      },
    })

    if (existing) {
      skipped++
      continue
    }

    await prisma.expense.create({
      data: {
        date: expenseDate,
        description: sub.name,
        amount: sub.amount,
        categoryId: sub.categoryId,
        subscriptionId: sub.id,
      },
    })
    generated++
  }

  return NextResponse.json({ generated, skipped })
}
