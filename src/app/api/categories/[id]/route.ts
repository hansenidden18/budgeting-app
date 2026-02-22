import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name, color } = await request.json()
  try {
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name: name?.trim(), color },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const count = await prisma.expense.count({ where: { categoryId: Number(id) } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} expense(s) use this category` },
      { status: 409 }
    )
  }
  await prisma.category.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
