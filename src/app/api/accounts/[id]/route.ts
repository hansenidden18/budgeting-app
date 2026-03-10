import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  try {
    const account = await prisma.account.update({
      where: { id: Number(id) },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.type && { type: body.type }),
        ...(body.balance !== undefined && { balance: parseFloat(body.balance) }),
      },
    })
    return NextResponse.json(account)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.account.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
