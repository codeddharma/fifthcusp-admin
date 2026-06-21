import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Action, Resource, can } from './permissions'
import { Spinner } from '@/components/ui/Spinner'

interface Props {
  children: ReactNode
  resource?: Resource
  action?: Action
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'booting') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (status !== 'authed' || !user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}

export function RequireRole({ children, resource, action = 'read' }: Props) {
  const { user } = useAuth()
  if (resource && !can(user?.role, resource, action)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
