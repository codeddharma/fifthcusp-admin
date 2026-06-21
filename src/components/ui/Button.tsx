import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-deep text-white hover:bg-brand-violet disabled:bg-shell-border-strong disabled:text-shell-dim',
  secondary:
    'bg-white border border-shell-border text-shell-text hover:bg-shell-bg disabled:bg-shell-bg disabled:text-shell-dim',
  ghost: 'bg-transparent text-shell-text hover:bg-shell-bg disabled:text-shell-dim',
  danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-60',
  subtle: 'bg-shell-bg text-shell-text hover:bg-shell-border disabled:opacity-60',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, className, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
      {!loading && leftIcon ? leftIcon : null}
      {children}
      {rightIcon ?? null}
    </button>
  )
})
