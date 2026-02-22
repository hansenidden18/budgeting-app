import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { expenses: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const { name, color } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  try {
    const category = await prisma.category.create({
      data: { name: name.trim(), color: color ?? "#6366f1" },
    })
    return NextResponse.json(category, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
  }
}
