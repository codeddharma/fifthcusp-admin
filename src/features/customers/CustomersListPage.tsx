import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { UserPlus } from 'lucide-react'
import { CustomersApi } from '@/lib/api/customers.api'
import { qk } from '@/lib/query/keys'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { formatDate } from '@/lib/utils/format'
import type { Customer } from '@/types/customer'

export function CustomersListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const params = { page, limit: 20, search: search || undefined }
  const { data, isLoading } = useQuery({
    queryKey: qk.customers.list(params),
    queryFn: () => CustomersApi.list(params),
  })

  const columns: ColumnDef<Customer>[] = [
    { header: 'ID', accessorKey: 'customerId' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Orders',
      accessorFn: (r) => r.orders?.length ?? 0,
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Customers</h1>
        <Button onClick={() => navigate('/customers/new')} size="sm">
          <UserPlus size={14} className="mr-1.5" />
          Add customer
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search by name, email, phone, or ID…"
        />
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No customers yet"
          onRowClick={(row) => navigate(`/customers/${row._id}`)}
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
