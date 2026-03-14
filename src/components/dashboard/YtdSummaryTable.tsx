"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="sticky left-0 z-10 bg-muted/50 px-4 whitespace-nowrap">
              Category
            </TableHead>
            {months.map((m) => (
              <TableHead key={m} className="text-right px-3 whitespace-nowrap">
                {m}
              </TableHead>
            ))}
            <TableHead className="text-right px-4 font-semibold whitespace-nowrap">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat, i) => {
            const rowTotal = months.reduce((sum, m) => sum + (data[cat]?.[m] ?? 0), 0)
            return (
              <TableRow key={cat} className={i % 2 !== 0 ? "bg-muted/20" : ""}>
                <TableCell className="sticky left-0 z-10 bg-background px-4 font-medium whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors[cat] }}
                    />
                    {cat}
                  </span>
                </TableCell>
                {months.map((m) => (
                  <TableCell key={m} className="text-right font-mono text-muted-foreground px-3">
                    {data[cat]?.[m] ? formatCurrency(data[cat][m]) : "-"}
                  </TableCell>
                ))}
                <TableCell className="text-right font-mono font-semibold px-4">
                  {formatCurrency(rowTotal)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow className="hover:bg-transparent font-semibold">
            <TableCell className="sticky left-0 z-10 bg-muted/50 px-4">Total</TableCell>
            {monthTotals.map((t, i) => (
              <TableCell key={i} className="text-right font-mono px-3">
                {formatCurrency(t)}
              </TableCell>
            ))}
            <TableCell className="text-right font-mono px-4">{formatCurrency(grandTotal)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
