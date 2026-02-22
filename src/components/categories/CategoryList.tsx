"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryForm } from "./CategoryForm"
import type { Category } from "@/lib/types"

interface CategoryListProps {
  categories: Category[]
  onRefresh: () => void
}

export function CategoryList({ categories, onRefresh }: CategoryListProps) {
  const [editing, setEditing] = useState<Category | null>(null)

  async function handleDelete(category: Category) {
    const count = category._count?.expenses ?? 0
    if (count > 0) {
      toast.error(`Cannot delete "${category.name}": it has ${count} expense(s)`)
      return
    }
    if (!confirm(`Delete category "${category.name}"?`)) return

    const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? "Delete failed")
    } else {
      toast.success("Category deleted")
      onRefresh()
    }
  }

  if (categories.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No categories yet. Add one to get started.
      </p>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="h-8 w-8 flex-shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cat._count?.expenses ?? 0} expense(s)
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditing(cat)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(cat)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <CategoryForm
          category={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
