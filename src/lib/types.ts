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
  createdAt: string
  updatedAt: string
}

export interface Investment {
  id: number
  name: string
  assetType: AssetType
  avgBuyPrice: number
  currentPrice: number
  quantity: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  marketValue?: number
  gainLossDollar?: number
  gainLossPercent?: number | null
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
  ytdTotal: number
  largestCategory: { name: string; amount: number } | null
  categoryNames: string[]
  categoryColors: Record<string, string>
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  STOCK: "Stock",
  CRYPTO: "Crypto",
  ETF: "ETF",
  BOND: "Bond",
  PRIVATE_EQUITY: "Private Equity",
  OTHER: "Other",
}
