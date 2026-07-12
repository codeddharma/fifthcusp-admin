import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Pencil, Copy, CheckCheck, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ServicesApi } from '@/lib/api/services.api'
import { qk } from '@/lib/query/keys'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SearchBar } from '@/components/ui/SearchBar'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'
import { toApiError } from '@/lib/api/errors'
import { formatINR } from '@/lib/utils/format'
import type { Service } from '@/types/service'

const PAGE_SIZE = 20

const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:3000'

// Page keys now match storefront routes (tarot-reading, astrology, vastu, …) after the data
// migration. The only exception is `home`, whose route is the site root `/` (no slug).
const PAGE_ROUTES: Record<string, string> = {
  home: '',
}

// Per-service "share the booking form" cell: a link to the service's public page with a
// `?book=<SKU>` param that auto-opens the BookingModal on the storefront.
function ServiceLinkCell({ service }: { service: Service }) {
  const [copied, setCopied] = useState(false)
  const page = service.pages?.[0]?.page

  if (!page) {
    return (
      <span className="text-xs text-shell-muted" title="Assign a page to this service to generate a link">
        —
      </span>
    )
  }

  const routeSegment = PAGE_ROUTES[page] ?? page
  const url = `${FRONTEND_BASE}/${routeSegment}?book=${service.sku}`

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `Book "${service.title}" here: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); copy() }}
        className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-shell-muted hover:bg-shell-bg hover:text-shell-text"
      >
        {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); shareWhatsApp() }}
        className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-shell-muted hover:bg-shell-bg hover:text-shell-text"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle size={12} />
        WhatsApp
      </button>
    </div>
  )
}

export function ServicesListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null)

  // GET /services returns a plain array — client-side pagination + search
  const { data, isLoading } = useQuery({
    queryKey: qk.services.list({}),
    queryFn: () => ServicesApi.list(),
  })

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.toLowerCase().trim()
    if (!q) return data
    return data.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.sku.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q),
    )
  }, [data, search])

  const start = (page - 1) * PAGE_SIZE
  const items = filtered.slice(start, start + PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const remove = useMutation({
    mutationFn: (id: string) => ServicesApi.remove(id),
    onSuccess: () => {
      toast.success('Service deleted')
      qc.invalidateQueries({ queryKey: qk.services.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'services', 'write')
  const canDelete = can(user?.role, 'services', 'delete')

  const columns: ColumnDef<Service>[] = [
    { header: 'SKU', accessorKey: 'sku', cell: ({ getValue }) => <code className="text-xs">{getValue<string>()}</code> },
    { header: 'Title', accessorKey: 'title' },
    { header: 'Type', accessorKey: 'type', cell: ({ getValue }) => <Badge tone="brand">{getValue<string>()}</Badge> },
    { header: 'Price', accessorKey: 'price', cell: ({ getValue }) => formatINR(getValue<number>()) },
    {
      header: 'Sold',
      accessorKey: 'soldCount',
    },
    {
      header: 'Active',
      accessorKey: 'isActiveService',
      cell: ({ getValue }) =>
        getValue<boolean>() ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>,
    },
    {
      header: 'Booking link',
      id: 'bookingLink',
      cell: ({ row }) => <ServiceLinkCell service={row.original} />,
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
                navigate(`/services/${row.original._id}/edit`)
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
        <h1 className="text-xl font-semibold text-shell-heading">Services</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/services/new')}>
            <Plus size={14} /> New service
          </Button>
        ) : null}
      </div>

      <div className="max-w-sm">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by SKU, title, type…" />
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={items}
          columns={columns}
          loading={isLoading}
          emptyTitle="No services yet"
          onRowClick={(row) => navigate(`/services/${row._id}`)}
        />
        {filtered.length ? (
          <Pagination page={page} totalPages={totalPages} total={filtered.length} onChange={setPage} />
        ) : null}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete._id)}
        title="Delete service"
        description={`Delete "${pendingDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
