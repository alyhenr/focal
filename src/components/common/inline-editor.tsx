'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditorProps {
  value: string
  onSave: (value: string) => void | Promise<void>
  onCancel?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  submitOnEnter?: boolean
}

export function InlineEditor({
  value: initialValue,
  onSave,
  onCancel,
  placeholder = 'Enter text...',
  className,
  autoFocus = true,
  submitOnEnter = true,
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [autoFocus])

  const handleSave = async () => {
    if (!value.trim() || value === initialValue) {
      handleCancel()
      return
    }

    setIsLoading(true)
    try {
      await onSave(value.trim())
    } catch {
      // Error handling is done by the parent
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setValue(initialValue)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && submitOnEnter) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="h-8 text-sm"
      />
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading || !value.trim() || value === initialValue}
          className="h-8 w-8"
        >
          <Check className="h-4 w-4 text-success" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <X className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}