import { cloneElement, isValidElement } from 'react'
import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-primary text-primary-foreground hover:brightness-95',
  secondary: 'bg-secondary text-secondary-foreground hover:brightness-95',
  outline: 'border border-border bg-transparent text-text hover:bg-white/70',
  ghost: 'bg-transparent text-text hover:bg-black/5',
}

const sizes = {
  default: 'h-11 px-5 text-sm',
  sm: 'h-9 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}) {
  const sharedClassName = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      className: cn(children.props.className, sharedClassName),
    })
  }

  return (
    <button className={sharedClassName} {...props}>
      {children}
    </button>
  )
}
