import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom'

export function RouteError() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : null
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'Unexpected error'

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-lg font-semibold text-shell-heading">{status ?? 'Error'}</h1>
      <p className="max-w-md text-sm text-shell-muted">{message}</p>
      <Link to="/dashboard" className="text-sm font-medium text-brand-deep underline">
        Back to dashboard
      </Link>
    </div>
  )
}
