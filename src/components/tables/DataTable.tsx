import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { ReactNode } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  onRowClick?: (row: T) => void
}

export function DataTable<T>({
  data,
  columns,
  loading,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  onRowClick,
}: DataTableProps<T>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-shell-border text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="bg-shell-bg">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-shell-muted"
                >
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-shell-border bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-shell-bg' : ''}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 align-middle text-shell-text">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
