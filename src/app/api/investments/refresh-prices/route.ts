import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface YahooQuoteResult {
  regularMarketPrice?: number
  symbol?: string
}

async function fetchYahooQuote(ticker: string): Promise<number> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) {
    throw new Error(`Yahoo Finance returned ${res.status} for ${ticker}`)
  }
  const data = await res.json()
  const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
  if (typeof price !== "number" || isNaN(price)) {
    throw new Error(`No price data for ticker "${ticker}"`)
  }
  return price
}

export async function POST() {
  const investments = await prisma.investment.findMany({
    where: {
      ticker: { not: null },
    },
  })

  const toRefresh = investments.filter((inv) => inv.ticker && inv.ticker.trim() !== "")

  if (toRefresh.length === 0) {
    return NextResponse.json({ updated: 0, errors: [] })
  }

  const errors: Array<{ ticker: string; error: string }> = []
  let updated = 0

  for (const inv of toRefresh) {
    try {
      const price = await fetchYahooQuote(inv.ticker!)
      await prisma.investment.update({
        where: { id: inv.id },
        data: {
          currentPrice: price,
          priceUpdatedAt: new Date(),
        },
      })
      updated++
    } catch (err) {
      errors.push({
        ticker: inv.ticker!,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
    // Small delay between requests to avoid rate limiting
    if (toRefresh.indexOf(inv) < toRefresh.length - 1) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  return NextResponse.json({ updated, errors })
}
