import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Wrench } from 'lucide-react'
import { OrdersApi } from '@/lib/api/orders.api'
import { qk } from '@/lib/query/keys'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatDate, formatINR } from '@/lib/utils/format'
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type Order,
  type OrderListFilters,
  type OrderStatus,
  type PaymentStatus,
} from '@/types/order'

const statusTone: Record<OrderStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  created: 'info',
  scheduled: 'info',
  in_progress: 'warning',
  on_hold: 'neutral',
  awaiting_feedback: 'warning',
  completed: 'success',
  closed: 'neutral',
  cancelled: 'danger',
}

const payTone: Record<PaymentStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
}

export function OrdersListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [orderStatus, setOrderStatus] = useState<OrderStatus | ''>('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [serviceSku, setServiceSku] = useState('')

  const filters: OrderListFilters = {
    page,
    limit: 20,
    ...(orderStatus ? { orderStatus } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(customerEmail ? { customerEmail } : {}),
    ...(serviceSku ? { serviceSku } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: qk.orders.list(filters),
    queryFn: () => OrdersApi.list(filters),
  })

  const columns: ColumnDef<Order>[] = [
    {
      header: 'Order #',
      accessorKey: 'orderNumber',
      cell: ({ getValue }) => <code className="text-xs">{getValue<string>()}</code>,
    },
    {
      header: 'Service',
      accessorFn: (r) => r.serviceSnapshot?.title ?? r.serviceSku,
    },
    {
      header: 'Customer',
      accessorFn: (r) => (typeof r.customerId === 'object' ? r.customerId.email : '—'),
    },
    {
      header: 'Amount',
      accessorFn: (r) => r.pricing?.finalAmount ?? 0,
      cell: ({ getValue }) => formatINR(getValue<number>()),
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus',
      cell: ({ getValue }) => (
        <Badge tone={payTone[getValue<PaymentStatus>()]}>{getValue<string>()}</Badge>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'orderStatus',
      cell: ({ getValue }) => (
        <Badge tone={statusTone[getValue<OrderStatus>()]}>{getValue<string>()}</Badge>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Orders</h1>
        <Button variant="secondary" onClick={() => navigate('/orders/maintenance')}>
          <Wrench size={14} /> Maintenance
        </Button>
      </div>

      <div className="surface flex flex-wrap items-end gap-3 p-3">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs text-shell-muted">Order status</label>
          <Select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as OrderStatus | '')}>
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs text-shell-muted">Payment</label>
          <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | '')}>
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="grow min-w-[200px]">
          <label className="mb-1 block text-xs text-shell-muted">Customer email</label>
          <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="name@example.com" />
        </div>
        <div className="grow min-w-[160px]">
          <label className="mb-1 block text-xs text-shell-muted">Service SKU</label>
          <Input value={serviceSku} onChange={(e) => setServiceSku(e.target.value.toUpperCase())} placeholder="SKU" />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setOrderStatus('')
            setPaymentStatus('')
            setCustomerEmail('')
            setServiceSku('')
            setPage(1)
          }}
        >
          Reset
        </Button>
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No orders match these filters"
          onRowClick={(row) => navigate(`/orders/${row._id}`)}
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

      <p className="text-xs text-shell-muted">
        Need to look up an order by number? Customer flow runs on the public site —{' '}
        <Link to="/orders" className="underline">use filters above</Link>.
      </p>
    </div>
  )
}
