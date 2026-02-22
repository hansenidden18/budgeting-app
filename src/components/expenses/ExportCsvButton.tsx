"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportCsvButtonProps {
  month: string
  year: string
  categoryId: string
}

export function ExportCsvButton({ month, year, categoryId }: ExportCsvButtonProps) {
  function handleExport() {
    const params = new URLSearchParams()
    if (year) params.set("year", year)
    if (month && month !== "0") params.set("month", month)
    if (categoryId && categoryId !== "0") params.set("categoryId", categoryId)
    window.location.href = `/api/expenses/export?${params.toString()}`
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" /> Export CSV
    </Button>
  )
}
