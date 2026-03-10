import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { ticker } = await request.json()
  if (!ticker || typeof ticker !== "string") {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 })
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker.trim())}?range=1d&interval=1d`
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { valid: false, error: `Ticker "${ticker}" not found` },
        { status: 200 }
      )
    }

    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    const price = meta?.regularMarketPrice
    const currency = meta?.currency ?? "USD"
    const exchangeName = meta?.exchangeName ?? ""
    const fullName = meta?.shortName ?? meta?.longName ?? ticker

    if (typeof price !== "number" || isNaN(price)) {
      return NextResponse.json(
        { valid: false, error: `No price data for "${ticker}"` },
        { status: 200 }
      )
    }

    return NextResponse.json({
      valid: true,
      ticker: ticker.trim().toUpperCase(),
      price,
      currency,
      exchangeName,
      fullName,
    })
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: err instanceof Error ? err.message : "Failed to verify ticker" },
      { status: 200 }
    )
  }
}
