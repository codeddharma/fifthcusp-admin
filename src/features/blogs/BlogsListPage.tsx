import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Pencil, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { BlogsApi } from '@/lib/api/blogs.api'
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
import type { Blog } from '@/types/blog'

export function BlogsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Blog | null>(null)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.blogs.list(params),
    queryFn: () => BlogsApi.list(params),
  })

  const publish = useMutation({
    mutationFn: (id: string) => BlogsApi.publish(id),
    onSuccess: () => {
      toast.success('Published')
      qc.invalidateQueries({ queryKey: qk.blogs.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const unpublish = useMutation({
    mutationFn: (id: string) => BlogsApi.unpublish(id),
    onSuccess: () => {
      toast.success('Unpublished')
      qc.invalidateQueries({ queryKey: qk.blogs.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => BlogsApi.remove(id),
    onSuccess: () => {
      toast.success('Blog deleted')
      qc.invalidateQueries({ queryKey: qk.blogs.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'blogs', 'write')
  const canDelete = can(user?.role, 'blogs', 'delete')

  const columns: ColumnDef<Blog>[] = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Slug', accessorKey: 'slug' },
    { header: 'Category', accessorKey: 'category' },
    {
      header: 'Status',
      accessorKey: 'isPublished',
      cell: ({ row }) =>
        row.original.isPublished ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>,
    },
    {
      header: 'Updated',
      accessorKey: 'updatedAt',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {canWrite ? (
            row.original.isPublished ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  unpublish.mutate(row.original._id)
                }}
                aria-label="Unpublish"
              >
                <EyeOff size={14} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  publish.mutate(row.original._id)
                }}
                aria-label="Publish"
              >
                <Eye size={14} />
              </Button>
            )
          ) : null}
          {canWrite ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/blogs/${row.original._id}/edit`)
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
        <h1 className="text-xl font-semibold text-shell-heading">Blogs</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/blogs/new')}>
            <Plus size={14} /> New blog
          </Button>
        ) : null}
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No blogs yet"
          onRowClick={(row) => canWrite && navigate(`/blogs/${row._id}/edit`)}
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
        title="Delete blog"
        description={`Delete "${pendingDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
