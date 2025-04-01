"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditableTextProps {
  initialValue: string
  onSave?: (value: string) => void
  className?: string
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  placeholder?: string
  disabled?: boolean
}

export function EditableText({
  initialValue,
  onSave,
  className = "",
  tag = "p",
  placeholder = "Click to edit",
  disabled = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [originalValue, setOriginalValue] = useState(initialValue)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Place cursor at the end of the text
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }, [isEditing])

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true)
      setOriginalValue(value)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    if (onSave && value !== originalValue) {
      onSave(value)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValue(originalValue) // Reset to original value if canceled
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      handleCancel()
    }
  }

  const renderElement = () => {
    if (isEditing) {
      return (
        <div className="relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent resize-none overflow-hidden transition-all duration-200 outline-none focus:outline-none border-2 border-primary rounded px-2 py-1.5 ${className}`}
            rows={value.split("\n").length}
            style={{
              minHeight: "1.5em",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              lineHeight: "inherit",
              color: "inherit",
            }}
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleCancel}
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )
    }

    const TagName = tag
    return (
      <div
        className={`group relative cursor-pointer ${disabled ? "cursor-not-allowed" : ""} transition-colors duration-200 ${className}`}
        onClick={handleClick}
      >
        <TagName
          className={`${value ? "" : "text-gray-400 italic"} relative py-1 px-0.5 border border-transparent hover:border-dashed hover:border-gray-300 dark:hover:border-gray-600 rounded`}
        >
          {value || placeholder}
        </TagName>
        {!disabled && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 shadow-sm rounded-md border border-gray-200 dark:border-gray-700 p-1 cursor-pointer">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              aria-label="Edit text"
            >
              <Pencil className="h-3.5 w-3.5 text-primary" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return renderElement()
}

