import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { FaqsApi } from '@/lib/api/faqs.api'
import { qk } from '@/lib/query/keys'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'
import { toApiError } from '@/lib/api/errors'
import type { Faq } from '@/types/faq'

export function FaqsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Faq | null>(null)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.faqs.list(params),
    queryFn: () => FaqsApi.list(params),
  })

  const remove = useMutation({
    mutationFn: (id: string) => FaqsApi.remove(id),
    onSuccess: () => {
      toast.success('FAQ deleted')
      qc.invalidateQueries({ queryKey: qk.faqs.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'faqs', 'write')
  const canDelete = can(user?.role, 'faqs', 'delete')

  const columns: ColumnDef<Faq>[] = [
    { header: 'Page', accessorKey: 'page', cell: ({ getValue }) => <Badge tone="brand">{getValue<string>()}</Badge> },
    {
      header: 'Items',
      accessorFn: (r) => r.faqs?.length ?? 0,
      cell: ({ getValue }) => <span>{getValue<number>()} questions</span>,
    },
    {
      header: 'Active',
      accessorFn: (r) => r.faqs?.filter((f) => f.isActive).length ?? 0,
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
                navigate(`/faqs/${row.original._id}/edit`)
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
        <h1 className="text-xl font-semibold text-shell-heading">FAQs</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/faqs/new')}>
            <Plus size={14} /> New FAQ group
          </Button>
        ) : null}
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No FAQs yet"
          onRowClick={(row) => canWrite && navigate(`/faqs/${row._id}/edit`)}
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
        title="Delete FAQ group"
        description={`Delete the FAQ group for "${pendingDelete?.page}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
