import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
        className,
      )}
      {...props}
    />
  )
})
