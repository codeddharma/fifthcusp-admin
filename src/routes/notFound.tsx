import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-3xl font-semibold text-shell-heading">404</h1>
      <p className="text-sm text-shell-muted">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="text-sm font-medium text-brand-deep underline">
        Back to dashboard
      </Link>
    </div>
  )
}
