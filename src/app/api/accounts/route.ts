import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(accounts)
}

export async function POST(request: Request) {
  const { name, type, balance } = await request.json()
  if (!name || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const account = await prisma.account.create({
    data: {
      name: name.trim(),
      type,
      balance: balance !== undefined ? parseFloat(balance) : 0,
    },
  })
  return NextResponse.json(account, { status: 201 })
}
