import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const url = process.env.DATABASE_URL ?? "file:./data/budget.db"
const adapter = new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.category.count()
  if (existing > 0) {
    console.log("Categories already seeded, skipping.")
    return
  }

  await prisma.category.createMany({
    data: [
      { name: "Mandatory", color: "#ef4444" },
      { name: "Food", color: "#22c55e" },
      { name: "Shopping", color: "#3b82f6" },
    ],
  })

  console.log("Seeded 3 default categories.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
