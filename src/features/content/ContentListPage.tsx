import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ContentApi } from '@/lib/api/content.api'
import { qk } from '@/lib/query/keys'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/tables/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'
import { toApiError } from '@/lib/api/errors'
import type { PageContent } from '@/types/content'

export function ContentListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [pendingDelete, setPendingDelete] = useState<PageContent | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: qk.content.list(),
    queryFn: () => ContentApi.list(),
  })

  const remove = useMutation({
    mutationFn: (page: string) => ContentApi.deletePage(page),
    onSuccess: () => {
      toast.success('Page deleted')
      qc.invalidateQueries({ queryKey: qk.content.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'content', 'write')
  const canDelete = can(user?.role, 'content', 'delete')

  const columns: ColumnDef<PageContent>[] = [
    {
      header: 'Page',
      accessorKey: 'page',
      cell: ({ getValue }) => <Badge tone="brand">{getValue<string>()}</Badge>,
    },
    { header: 'Slug', accessorKey: 'slug' },
    { header: 'Meta title', accessorKey: 'metaTitle' },
    {
      header: 'Sections',
      accessorFn: (r) => r.sections?.length ?? 0,
    },
    {
      header: 'Status',
      accessorKey: 'isPublished',
      cell: ({ getValue }) =>
        getValue<boolean>() ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>,
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
                navigate(`/content/${row.original.page}/edit`)
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
        <h1 className="text-xl font-semibold text-shell-heading">Page content</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/content/new')}>
            <Plus size={14} /> New page
          </Button>
        ) : null}
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No pages yet"
          onRowClick={(row) => canWrite && navigate(`/content/${row.page}/edit`)}
        />
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.page)}
        title="Delete page"
        description={`Delete "${pendingDelete?.page}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
