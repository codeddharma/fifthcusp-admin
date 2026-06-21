import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon ? <div className="text-shell-dim">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-shell-heading">{title}</h3>
      {description ? <p className="max-w-md text-sm text-shell-muted">{description}</p> : null}
      {action}
    </div>
  )
}
