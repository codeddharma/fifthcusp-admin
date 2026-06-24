import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { CalendarEventsApi } from '@/lib/api/calendarEvents.api'
import { qk } from '@/lib/query/keys'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'
import { formatDate } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'
import { EVENT_TYPE_LABELS, type CalendarEvent } from '@/types/calendarEvent'

export function CalendarEventsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null)

  const params = { page, limit: 20 }
  const { data, isLoading } = useQuery({
    queryKey: qk.calendarEvents.list(params),
    queryFn: () => CalendarEventsApi.list(params),
  })

  const remove = useMutation({
    mutationFn: (id: string) => CalendarEventsApi.remove(id),
    onSuccess: () => {
      toast.success('Event deleted')
      qc.invalidateQueries({ queryKey: qk.calendarEvents.all() })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const canWrite = can(user?.role, 'calendarEvents', 'write')
  const canDelete = can(user?.role, 'calendarEvents', 'delete')

  const columns: ColumnDef<CalendarEvent>[] = [
    { header: 'Title', accessorKey: 'title', cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
    {
      header: 'Type',
      accessorKey: 'eventType',
      cell: ({ row }) => <Badge tone="brand">{EVENT_TYPE_LABELS[row.original.eventType]}</Badge>,
    },
    { header: 'Date', cell: ({ row }) => formatDate(row.original.date) },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge tone={row.original.isActive ? 'success' : 'neutral'}>
          {row.original.isActive ? 'Active' : 'Hidden'}
        </Badge>
      ),
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
                navigate(`/calendar-events/${row.original._id}/edit`)
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
        <h1 className="text-xl font-semibold text-shell-heading">Calendar Events</h1>
        {canWrite ? (
          <Button onClick={() => navigate('/calendar-events/new')}>
            <Plus size={14} /> New event
          </Button>
        ) : null}
      </div>

      <div className="surface overflow-hidden">
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          emptyTitle="No calendar events yet"
          onRowClick={(row) => canWrite && navigate(`/calendar-events/${row._id}/edit`)}
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
        title="Delete calendar event"
        description={`Delete "${pendingDelete?.title}"? It will disappear from the manifestation calendar.`}
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
      />
    </div>
  )
}
