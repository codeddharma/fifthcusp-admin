import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { UsersApi } from '@/lib/api/users.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils/format'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: me } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: qk.users.detail(id!),
    queryFn: () => UsersApi.get(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link to="/users" className="text-sm text-shell-muted hover:text-shell-text">
          ← Users
        </Link>
        {can(me?.role, 'users', 'write') ? (
          <Button onClick={() => navigate(`/users/${id}/edit`)}>
            <Pencil size={14} /> Edit
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-shell-muted">Email</dt>
          <dd>{data.email}</dd>
          <dt className="text-shell-muted">Role</dt>
          <dd>
            <Badge tone="brand">{data.role}</Badge>
          </dd>
          <dt className="text-shell-muted">Status</dt>
          <dd>
            {data.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>}
          </dd>
          <dt className="text-shell-muted">Created</dt>
          <dd>{formatDateTime(data.createdAt)}</dd>
          <dt className="text-shell-muted">Updated</dt>
          <dd>{formatDateTime(data.updatedAt)}</dd>
        </dl>
      </Card>
    </div>
  )
}
