import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { PageMetaApi } from '@/lib/api/pageMeta.api'
import { qk } from '@/lib/query/keys'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/Button'
import type { PageMeta } from '@/types/pageMeta'

export function PageMetaListPage() {
  const navigate = useNavigate()
  const [page] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: qk.pageMeta.list(),
    queryFn: () => PageMetaApi.list(),
  })

  const columns: ColumnDef<PageMeta>[] = [
    { header: 'Page Path', accessorKey: 'pagePath' },
    { header: 'Meta Title', accessorKey: 'metaTitle' },
    {
      header: 'Description',
      accessorKey: 'metaDescription',
      cell: ({ getValue }) => (
        <span className="line-clamp-1 max-w-xs text-shell-muted">{getValue<string>()}</span>
      ),
    },
    {
      header: 'Keywords',
      accessorFn: (r) => r.metaKeywords?.join(', ') ?? '—',
      cell: ({ getValue }) => (
        <span className="line-clamp-1 max-w-xs text-sm">{getValue<string>()}</span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Page SEO Meta</h1>
        <Button onClick={() => navigate('/page-meta/new')} size="sm">
          <Plus size={14} className="mr-1.5" />
          Add page
        </Button>
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No page meta entries yet"
          onRowClick={(row) => navigate(`/page-meta/${row._id}/edit`)}
        />
      </div>
    </div>
  )
}
