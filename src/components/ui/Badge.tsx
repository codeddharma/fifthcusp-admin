import { ReactNode } from 'react'
import clsx from 'clsx'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  className?: string
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-shell-bg text-shell-text border-shell-border',
  success: 'bg-success-bg text-success border-success/20',
  warning: 'bg-warning-bg text-warning border-warning/20',
  danger: 'bg-danger-bg text-danger border-danger/20',
  info: 'bg-info-bg text-info border-info/20',
  brand: 'bg-brand-purple/15 text-brand-deep border-brand-purple/30',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
