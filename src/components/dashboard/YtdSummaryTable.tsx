"use client"

import { formatCurrency } from "@/lib/utils"

interface YtdTableData {
  categories: string[]
  months: string[]
  data: Record<string, Record<string, number>>
  colors: Record<string, string>
}

interface YtdSummaryTableProps {
  ytdTable: YtdTableData
}

export function YtdSummaryTable({ ytdTable }: YtdSummaryTableProps) {
  const { categories, months, data, colors } = ytdTable

  if (!categories.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data for this year</p>
  }

  const monthTotals = months.map((m) =>
    categories.reduce((sum, cat) => sum + (data[cat]?.[m] ?? 0), 0)
  )
  const grandTotal = monthTotals.reduce((a, b) => a + b, 0)

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 bg-muted/50 px-4 py-3 text-left font-medium whitespace-nowrap">
              Category
            </th>
            {months.map((m) => (
              <th key={m} className="px-3 py-3 text-right font-medium whitespace-nowrap">
                {m}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => {
            const rowTotal = months.reduce((sum, m) => sum + (data[cat]?.[m] ?? 0), 0)
            return (
              <tr key={cat} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="sticky left-0 bg-background px-4 py-2 font-medium whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors[cat] }}
                    />
                    {cat}
                  </span>
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right font-mono text-muted-foreground">
                    {data[cat]?.[m] ? formatCurrency(data[cat][m]) : "-"}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-mono font-semibold">
                  {formatCurrency(rowTotal)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/50 font-semibold">
            <td className="sticky left-0 bg-muted/50 px-4 py-3">Total</td>
            {monthTotals.map((t, i) => (
              <td key={i} className="px-3 py-3 text-right font-mono">
                {formatCurrency(t)}
              </td>
            ))}
            <td className="px-4 py-3 text-right font-mono">{formatCurrency(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
