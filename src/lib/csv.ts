export interface ParsedExpenseRow {
  date: Date
  description: string
  category: string
  amount: number
}

export function parseCsv(content: string): ParsedExpenseRow[] {
  const lines = content.split("\n")
  const rows: ParsedExpenseRow[] = []

  for (const line of lines) {
    const cols = parseCsvLine(line)
    if (cols.length < 4) continue

    const rawDate = cols[0].trim()
    const description = cols[1].trim()
    const category = cols[2].trim()
    const rawAmount = cols[3].trim()

    if (!rawDate || !description || !category) continue

    const date = parseFlexibleDate(rawDate)
    if (!date) continue

    const amount = parseAmount(rawAmount)
    if (isNaN(amount) || amount === 0) continue

    rows.push({ date, description, category, amount })
  }

  return rows
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseFlexibleDate(raw: string): Date | null {
  const cleaned = raw.replace(/['"]/g, "").trim()
  if (!cleaned) return null

  const parts = cleaned.split("/")
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10)
    const day = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      const d = new Date(year, month - 1, day)
      if (!isNaN(d.getTime())) return d
    }
  }

  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d

  return null
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[$,\s'"]/g, "")
  return parseFloat(cleaned)
}

export function generateCsv(
  expenses: Array<{
    date: Date | string
    description: string
    category: { name: string }
    amount: number
  }>
): string {
  const header = "Date,Description,Category,Amount"
  const lines = expenses.map((e) => {
    const d = new Date(e.date)
    const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
    const desc = e.description.includes(",")
      ? `"${e.description}"`
      : e.description
    const cat = e.category.name.includes(",")
      ? `"${e.category.name}"`
      : e.category.name
    return `${dateStr},${desc},${cat},${e.amount.toFixed(2)}`
  })
  return [header, ...lines].join("\n")
}
