import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Pencil, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { CareersApi } from '@/lib/api/careers.api'
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
import type { Career } from '@/types/career'

export function CareersListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Career | null>(null)
  const [pendingClose, setPendingClose] = useState<Career | null>(null)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.careers.list(params),
    queryFn: () => CareersApi.list(params),
  })

  const close = useMutation({
    mutationFn: (id: string) => CareersApi.close(id),
    onSuccess: () => {
      toast.success('Closed')
      qc.invalidateQueries({ queryKey: qk.careers.all() })
      setPendingClose(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => CareersApi.remove(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: qk.careers.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'careers', 'write')
  const canDelete = can(user?.role, 'careers', 'delete')

  const columns: ColumnDef<Career>[] = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Department', accessorKey: 'department' },
    { header: 'Location', accessorKey: 'location' },
    {
      header: 'Type',
      accessorKey: 'employmentType',
      cell: ({ getValue }) => <Badge tone="brand">{getValue<string>()}</Badge>,
    },
    {
      header: 'Status',
      cell: ({ row }) =>
        row.original.isClosed ? (
          <Badge tone="danger">Closed</Badge>
        ) : row.original.isActive ? (
          <Badge tone="success">Active</Badge>
        ) : (
          <Badge tone="warning">Inactive</Badge>
        ),
    },
    {
      header: 'Deadline',
      accessorKey: 'applicationDeadline',
      cell: ({ getValue }) => formatDate(getValue<string | undefined>()),
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {canWrite && !row.original.isClosed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setPendingClose(row.original)
              }}
              aria-label="Close"
            >
              <Lock size={14} />
            </Button>
          ) : null}
          {canWrite ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/careers/${row.original._id}/edit`)
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
        <h1 className="text-xl font-semibold text-shell-heading">Careers</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/careers/new')}>
            <Plus size={14} /> New opening
          </Button>
        ) : null}
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No openings yet"
          onRowClick={(row) => canWrite && navigate(`/careers/${row._id}/edit`)}
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
        open={!!pendingClose}
        onClose={() => setPendingClose(null)}
        onConfirm={() => pendingClose && close.mutate(pendingClose._id)}
        title="Close opening"
        description={`Close "${pendingClose?.title}"? It will no longer accept applications.`}
        confirmLabel="Close"
        loading={close.isPending}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete._id)}
        title="Delete opening"
        description={`Delete "${pendingDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
