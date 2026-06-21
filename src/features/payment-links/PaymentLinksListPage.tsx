import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Copy, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { PaymentLinksApi } from '@/lib/api/paymentLinks.api'
import { qk } from '@/lib/query/keys'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'
import type { PaymentLink, PaymentLinkStatus } from '@/types/paymentLink'

const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:3000'

const statusTone: Record<PaymentLinkStatus, 'success' | 'neutral' | 'danger' | 'warning'> = {
  paid: 'success',
  pending: 'warning',
  cancelled: 'neutral',
  expired: 'danger',
}

function CopyCell({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${FRONTEND_BASE}/pay/${token}`
  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); copy() }}
      className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-shell-muted hover:bg-shell-bg hover:text-shell-text"
    >
      {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

export function PaymentLinksListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.paymentLinks.list(params),
    queryFn: () => PaymentLinksApi.list(params),
  })

  const cancel = useMutation({
    mutationFn: (id: string) => PaymentLinksApi.cancel(id),
    onSuccess: () => {
      toast.success('Payment link cancelled')
      qc.invalidateQueries({ queryKey: qk.paymentLinks.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const columns: ColumnDef<PaymentLink>[] = [
    {
      header: 'Customer',
      cell: ({ row }) => {
        const c = row.original.customerId
        return typeof c === 'object' ? `${c.name} (${c.customerId})` : c
      },
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }) => <span className="line-clamp-1 max-w-[180px]">{getValue<string>()}</span>,
    },
    {
      header: 'Amount',
      cell: ({ row }) => `₹${row.original.amount.toLocaleString('en-IN')}`,
    },
    {
      header: 'Expires',
      cell: ({ row }) => formatDate(row.original.validUntil),
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge tone={statusTone[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      header: 'Link',
      id: 'link',
      cell: ({ row }) => <CopyCell token={row.original.token} />,
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) =>
        row.original.status === 'pending' ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); cancel.mutate(row.original._id) }}
          >
            Cancel
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Payment Links</h1>
        <Button onClick={() => navigate('/payment-links/new')} size="sm">
          <Plus size={14} className="mr-1.5" />
          New link
        </Button>
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No payment links yet"
          onRowClick={(row) => navigate(`/payment-links/${row._id}`)}
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
    </div>
  )
}
