import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { RecurringOrdersApi } from '@/lib/api/recurringOrders.api'
import { qk } from '@/lib/query/keys'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'
import type { RecurringOrder, RecurringOrderStatus } from '@/types/recurringOrder'

const statusTone: Record<RecurringOrderStatus, 'success' | 'neutral' | 'warning'> = {
  active: 'success',
  paused: 'warning',
  cancelled: 'neutral',
}

function intervalLabel(o: RecurringOrder): string {
  const unit = o.intervalCount === 1 ? o.intervalUnit : `${o.intervalUnit}s`
  return o.intervalCount === 1 ? `Every ${unit}` : `Every ${o.intervalCount} ${unit}`
}

export function RecurringOrdersListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.recurringOrders.list(params),
    queryFn: () => RecurringOrdersApi.list(params),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecurringOrderStatus }) =>
      RecurringOrdersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Recurring order updated')
      qc.invalidateQueries({ queryKey: qk.recurringOrders.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const columns: ColumnDef<RecurringOrder>[] = [
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
      header: 'Repeat',
      cell: ({ row }) => intervalLabel(row.original),
    },
    {
      header: 'Next link',
      cell: ({ row }) => formatDate(row.original.nextRunAt),
    },
    {
      header: 'Status',
      cell: ({ row }) => <Badge tone={statusTone[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const o = row.original
        if (o.status === 'cancelled') return null
        return (
          <div className="flex gap-1">
            {o.status === 'active' ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: o._id, status: 'paused' }) }}
              >
                Pause
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: o._id, status: 'active' }) }}
              >
                Resume
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: o._id, status: 'cancelled' }) }}
            >
              Cancel
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Recurring Orders</h1>
        <Button onClick={() => navigate('/recurring-orders/new')} size="sm">
          <Plus size={14} className="mr-1.5" />
          New recurring order
        </Button>
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No recurring orders yet"
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
