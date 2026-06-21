import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner'

interface Props {
  label: string
  value: ReactNode
  hint?: string
  to?: string
  loading?: boolean
  tone?: 'default' | 'warning' | 'success'
}

export function KpiCard({ label, value, hint, to, loading, tone = 'default' }: Props) {
  const inner = (
    <div className="surface flex h-full flex-col gap-1 p-5 transition-shadow hover:shadow-card-hover">
      <span className="text-xs uppercase tracking-wider text-shell-muted">{label}</span>
      <span
        className={
          'text-2xl font-semibold ' +
          (tone === 'warning' ? 'text-warning' : tone === 'success' ? 'text-success' : 'text-shell-heading')
        }
      >
        {loading ? <Spinner /> : value}
      </span>
      {hint ? <span className="text-xs text-shell-muted">{hint}</span> : null}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}
