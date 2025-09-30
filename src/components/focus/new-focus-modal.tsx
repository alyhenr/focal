'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Zap, Battery, BatteryLow, Target } from 'lucide-react'
import { toast } from 'sonner'
import { NorthStar } from '@/types/focus'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  energy_level: z.enum(['high', 'medium', 'low'] as const).optional(),
  north_star_id: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface NewFocusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData) => Promise<void>
  sessionNumber: number
  northStars?: NorthStar[]
}

const energyLevelOptions = [
  { value: 'high', label: 'High Energy', icon: Zap, color: 'text-yellow-500' },
  { value: 'medium', label: 'Medium Energy', icon: Battery, color: 'text-blue-500' },
  { value: 'low', label: 'Low Energy', icon: BatteryLow, color: 'text-muted-foreground' },
]

export function NewFocusModal({
  open,
  onOpenChange,
  onSubmit,
  sessionNumber,
  northStars = [],
}: NewFocusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      energy_level: 'medium',
    },
  })

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
      toast.success('Focus session created!', {
        description: `Session ${sessionNumber} is ready to go`,
      })
    } catch (error) {
      toast.error('Failed to create focus session', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Start Focus Session {sessionNumber}
          </DialogTitle>
          <DialogDescription>
            What will you focus on? Remember, one clear focus per session.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Focus Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Complete project proposal"
                      className="h-11"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any context or details..."
                      className="min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Additional context to help you stay focused
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="energy_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Current Energy Level
                  </FormLabel>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {energyLevelOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = field.value === option.value
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            relative p-3 rounded-lg border-2 transition-all
                            ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className={`h-5 w-5 ${option.color}`} />
                            <span className="text-xs font-medium">
                              {option.label}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              layoutId="energy-selector"
                              className="absolute inset-0 border-2 border-primary rounded-lg"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                  <FormDescription>
                    Match your task to your current energy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {northStars.length > 0 && (
              <FormField
                control={form.control}
                name="north_star_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Link to North Star <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a goal to contribute to" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {northStars.map((star) => (
                          <SelectItem key={star.id} value={star.id}>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <span>{star.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Connect this session to a long-term goal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Start Focus Session'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}