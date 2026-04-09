import { prisma } from "@/lib/db"
import type { BudgetStatus } from "@/lib/types"

export async function computeBudgetStatus(
  year: number,
  month: number
): Promise<BudgetStatus | null> {
  const budgets = await prisma.monthlyBudget.findMany({
    where: {
      OR: [
        { year, month: { gte: 1, lte: month } },
        { year: 0, month: 0 },
      ],
    },
  })

  const defaultBudget = budgets.find((b) => b.year === 0 && b.month === 0)
  const monthBudgets = new Map(
    budgets.filter((b) => b.year !== 0).map((b) => [b.month, b])
  )

  const explicitBudget = monthBudgets.get(month)
  const baseLimitSource = explicitBudget ?? defaultBudget
  if (!baseLimitSource) return null

  const baseLimit = baseLimitSource.amount
  const isDefault = !explicitBudget

  // Fetch all expenses (including reimbursements) for net spending
  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year, month, 1),
      },
    },
    select: { date: true, amount: true },
  })

  const spentByMonth = new Map<number, number>()
  for (const e of expenses) {
    const m = new Date(e.date).getMonth() + 1
    spentByMonth.set(m, (spentByMonth.get(m) ?? 0) + e.amount)
  }

  // Walk the rollover chain from January
  let rollover = 0
  for (let m = 1; m <= month; m++) {
    const mBudget = monthBudgets.get(m) ?? defaultBudget
    if (!mBudget) {
      rollover = 0
      continue
    }

    const mLimit = mBudget.amount
    const mEffective = mLimit + rollover
    const mSpent = spentByMonth.get(m) ?? 0

    if (m < month) {
      rollover = mEffective - mSpent
    } else {
      const spent = mSpent
      const effectiveLimit = mEffective
      return {
        hasBudget: true,
        baseLimit,
        effectiveLimit,
        spent,
        remaining: effectiveLimit - spent,
        rolloverAmount: rollover,
        percentUsed: effectiveLimit > 0 ? (spent / effectiveLimit) * 100 : 0,
        isOverBudget: spent > effectiveLimit,
        isDefault,
      }
    }
  }

  return null
}
