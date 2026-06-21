import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { CouponsApi } from '@/lib/api/coupons.api'
import { qk } from '@/lib/query/keys'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'
import type { Coupon } from '@/types/coupon'

export function CouponsListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.coupons.list(params),
    queryFn: () => CouponsApi.list(params),
  })

  const toggle = useMutation({
    mutationFn: (coupon: Coupon) => CouponsApi.update(coupon._id, { isActive: !coupon.isActive }),
    onSuccess: () => {
      toast.success('Coupon updated')
      qc.invalidateQueries({ queryKey: qk.coupons.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const columns: ColumnDef<Coupon>[] = [
    { header: 'Code', accessorKey: 'code', cell: ({ getValue }) => <span className="font-mono font-semibold">{getValue<string>()}</span> },
    {
      header: 'Discount',
      cell: ({ row }) =>
        row.original.discountType === 'percentage'
          ? `${row.original.discountValue}%`
          : `₹${row.original.discountValue}`,
    },
    {
      header: 'Uses',
      cell: ({ row }) =>
        row.original.maxUses > 0
          ? `${row.original.usedCount} / ${row.original.maxUses}`
          : `${row.original.usedCount} / ∞`,
    },
    {
      header: 'Expires',
      cell: ({ row }) =>
        row.original.expiresAt ? formatDate(row.original.expiresAt) : '—',
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge tone={row.original.isActive ? 'success' : 'neutral'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); toggle.mutate(row.original) }}
        >
          {row.original.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Coupons</h1>
        <Button onClick={() => navigate('/coupons/new')} size="sm">
          <Plus size={14} className="mr-1.5" />
          New coupon
        </Button>
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No coupons yet"
          onRowClick={(row) => navigate(`/coupons/${row._id}/edit`)}
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
