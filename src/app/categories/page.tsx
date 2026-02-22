"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryList } from "@/components/categories/CategoryList"
import { CategoryForm } from "@/components/categories/CategoryForm"
import type { Category } from "@/lib/types"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showAdd, setShowAdd] = useState(false)

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories")
    const data = await res.json()
    setCategories(data)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage your expense categories
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <CategoryList categories={categories} onRefresh={fetchCategories} />

      <CategoryForm
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchCategories}
      />
    </div>
  )
}
