import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { TestimonialsApi } from '@/lib/api/testimonials.api'
import { qk } from '@/lib/query/keys'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'
import { toApiError } from '@/lib/api/errors'
import { formatDate } from '@/lib/utils/format'
import type { Testimonial } from '@/types/testimonial'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

export function TestimonialsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<Filter>('pending')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null)

  const queryParams = useMemo(() => {
    const base: { page: number; limit: number; isApproved?: boolean; isRejected?: boolean } = {
      page,
      limit: 20,
    }
    if (filter === 'approved') base.isApproved = true
    if (filter === 'rejected') base.isRejected = true
    if (filter === 'pending') {
      base.isApproved = false
      base.isRejected = false
    }
    return base
  }, [filter, page])

  const { data, isLoading } = useQuery({
    queryKey: qk.testimonials.list(queryParams),
    queryFn: () => TestimonialsApi.list(queryParams),
  })

  const approve = useMutation({
    mutationFn: (id: string) => TestimonialsApi.approve(id),
    onSuccess: () => {
      toast.success('Approved')
      qc.invalidateQueries({ queryKey: qk.testimonials.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const reject = useMutation({
    mutationFn: (id: string) => TestimonialsApi.reject(id),
    onSuccess: () => {
      toast.success('Rejected')
      qc.invalidateQueries({ queryKey: qk.testimonials.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => TestimonialsApi.remove(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: qk.testimonials.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'testimonials', 'write')
  const canDelete = can(user?.role, 'testimonials', 'delete')

  const columns: ColumnDef<Testimonial>[] = [
    { header: 'Client', accessorKey: 'clientName' },
    {
      header: 'Feedback',
      accessorKey: 'feedback',
      cell: ({ getValue }) => (
        <span className="line-clamp-2 max-w-xl text-shell-muted">{getValue<string>()}</span>
      ),
    },
    {
      header: 'Services',
      accessorKey: 'services',
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {(getValue<string[]>() ?? []).map((s) => (
            <Badge key={s} tone="neutral">
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }) =>
        row.original.isApproved ? (
          <Badge tone="success">Approved</Badge>
        ) : row.original.isRejected ? (
          <Badge tone="danger">Rejected</Badge>
        ) : (
          <Badge tone="warning">Pending</Badge>
        ),
    },
    { header: 'Created', accessorKey: 'createdAt', cell: ({ getValue }) => formatDate(getValue<string>()) },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {canWrite && !row.original.isApproved ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                approve.mutate(row.original._id)
              }}
              aria-label="Approve"
            >
              <Check size={14} />
            </Button>
          ) : null}
          {canWrite && !row.original.isRejected ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                reject.mutate(row.original._id)
              }}
              aria-label="Reject"
            >
              <X size={14} />
            </Button>
          ) : null}
          {canWrite ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/testimonials/${row.original._id}/edit`)
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
        <h1 className="text-xl font-semibold text-shell-heading">Testimonials</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/testimonials/new')}>
            <Plus size={14} /> New testimonial
          </Button>
        ) : null}
      </div>

      <Tabs<Filter>
        value={filter}
        onChange={(v) => {
          setFilter(v)
          setPage(1)
        }}
        items={[
          { key: 'pending', label: 'Pending' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'all', label: 'All' },
        ]}
      />

      <div className="surface overflow-hidden">
        <DataTable data={data?.items ?? []} columns={columns} loading={isLoading} emptyTitle="No testimonials" />
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
        title="Delete testimonial"
        description={`Delete the testimonial from ${pendingDelete?.clientName}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
