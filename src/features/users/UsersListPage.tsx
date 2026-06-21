import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { UsersApi } from '@/lib/api/users.api'
import { qk } from '@/lib/query/keys'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'
import { toApiError } from '@/lib/api/errors'
import { formatDate } from '@/lib/utils/format'
import type { User } from '@/types/user'

export function UsersListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<User | null>(null)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.users.list(params),
    queryFn: () => UsersApi.list(params),
  })

  const remove = useMutation({
    mutationFn: (id: string) => UsersApi.remove(id),
    onSuccess: () => {
      toast.success('User deleted')
      qc.invalidateQueries({ queryKey: qk.users.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'users', 'write')
  const canDelete = can(user?.role, 'users', 'delete')

  const columns: ColumnDef<User>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ getValue }) => <Badge tone="brand">{getValue<string>()}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ getValue }) =>
        getValue<boolean>() ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {canWrite ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/users/${row.original._id}/edit`)
              }}
              aria-label="Edit"
            >
              <Pencil size={14} />
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setPendingDelete(row.original)
              }}
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Users</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/users/new')}>
            <Plus size={14} /> New user
          </Button>
        ) : null}
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No users yet"
          onRowClick={(row) => navigate(`/users/${row._id}`)}
        />
        {data ? (
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            onChange={setPage}
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete._id)}
        title="Delete user"
        description={`Delete ${pendingDelete?.email}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
