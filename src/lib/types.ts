export type AssetType =
  | "STOCK"
  | "CRYPTO"
  | "ETF"
  | "BOND"
  | "PRIVATE_EQUITY"
  | "OTHER"

export interface Category {
  id: number
  name: string
  color: string
  createdAt: string
  updatedAt: string
  _count?: { expenses: number }
}

export interface Expense {
  id: number
  date: string
  description: string
  amount: number
  categoryId: number
  category: Category
  subscriptionId: number | null
  createdAt: string
  updatedAt: string
}

export interface Investment {
  id: number
  name: string
  ticker: string | null
  assetType: AssetType
  avgBuyPrice: number
  currentPrice: number
  quantity: number | null
  notes: string | null
  priceUpdatedAt: string | null
  createdAt: string
  updatedAt: string
  marketValue?: number
  gainLossDollar?: number
  gainLossPercent?: number | null
}

export type SubscriptionFrequency = "MONTHLY" | "YEARLY" | "WEEKLY"

export interface Subscription {
  id: number
  name: string
  amount: number
  categoryId: number
  category: Category
  frequency: SubscriptionFrequency
  dayOfMonth: number
  startDate: string
  endDate: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AccountType = "CHECKING" | "SAVINGS" | "CASH"

export interface Account {
  id: number
  name: string
  type: AccountType
  balance: number
  createdAt: string
  updatedAt: string
}

export interface SavingsGoal {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  createdAt: string
  updatedAt: string
}

export interface CategoryInsight {
  name: string
  current: number
  previous: number
  changePercent: number
  changeDollar: number
}

export interface DashboardData {
  monthlyByCategory: Array<{ month: string; [key: string]: number | string }>
  periodByCategory: Array<{ name: string; value: number; color: string }>
  monthlyTotals: Array<{ month: string; total: number }>
  ytdTable: {
    categories: string[]
    months: string[]
    data: Record<string, Record<string, number>>
    colors: Record<string, string>
  }
  selectedMonthTotal: number
  previousMonthTotal: number
  monthOverMonthChange: number | null
  ytdTotal: number
  largestCategory: { name: string; amount: number } | null
  categoryNames: string[]
  categoryColors: Record<string, string>
  insights: CategoryInsight[]
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  STOCK: "Stock",
  CRYPTO: "Crypto",
  ETF: "ETF",
  BOND: "Bond",
  PRIVATE_EQUITY: "Private Equity",
  OTHER: "Other",
}
