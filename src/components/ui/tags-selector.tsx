"use client"

import * as React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

type Tag = {
  id: string
  label: string
  color?: string
}

type TagsSelectorProps = {
  tags: Tag[]
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

export function TagsSelector({ tags, selectedIds, onSelectionChange }: TagsSelectorProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([])
  const selectedsContainerRef = useRef<HTMLDivElement>(null)

  const selected = selectedIds ?? internalSelected

  const setSelected = (ids: string[]) => {
    setInternalSelected(ids)
    onSelectionChange?.(ids)
  }

  const removeSelectedTag = (id: string) => {
    setSelected(selected.filter((tid) => tid !== id))
  }

  const addSelectedTag = (id: string) => {
    setSelected([...selected, id])
  }

  const selectedTags = tags.filter((t) => selected.includes(t.id))

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: "smooth",
      })
    }
  }, [selected])

  return (
    <div className="w-full flex flex-col">
      {selected.length > 0 && (
        <motion.div
          className="w-full flex items-center justify-start gap-1.5 bg-background border h-10 mb-2 overflow-x-auto p-1 no-scrollbar rounded-xl"
          ref={selectedsContainerRef}
          layout
        >
          {selectedTags.map((tag) => (
            <motion.div
              key={tag.id}
              className="flex items-center gap-1 pl-2.5 pr-0.5 py-0.5 bg-background shadow-sm border h-full shrink-0 rounded-lg"
              layoutId={`tag-${tag.id}`}
            >
              {tag.color && (
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
              )}
              <motion.span
                layoutId={`tag-${tag.id}-label`}
                className="text-foreground text-xs font-medium"
              >
                {tag.label}
              </motion.span>
              <button
                onClick={() => removeSelectedTag(tag.id)}
                className="p-0.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="size-3 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
      {tags.length > selected.length && (
        <motion.div
          className="bg-background shadow-sm p-1.5 border w-full rounded-xl"
          layout
        >
          <motion.div className="flex flex-wrap gap-1.5">
            {tags
              .filter((tag) => !selected.includes(tag.id))
              .map((tag) => (
                <motion.button
                  key={tag.id}
                  layoutId={`tag-${tag.id}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 hover:bg-muted shrink-0 rounded-lg transition-colors"
                  onClick={() => addSelectedTag(tag.id)}
                >
                  {tag.color && (
                    <span
                      className="inline-block h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  <motion.span
                    layoutId={`tag-${tag.id}-label`}
                    className="text-foreground text-xs font-medium"
                  >
                    {tag.label}
                  </motion.span>
                </motion.button>
              ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
