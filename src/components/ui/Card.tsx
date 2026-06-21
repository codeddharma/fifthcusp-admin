import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={clsx('surface p-4 sm:p-5', className)}>{children}</div>
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx('mb-4 flex flex-wrap items-center justify-between gap-2', className)}>{children}</div>
  )
}

export function CardTitle({ children, className }: CardProps) {
  return <h2 className={clsx('text-base font-semibold text-shell-heading', className)}>{children}</h2>
}
