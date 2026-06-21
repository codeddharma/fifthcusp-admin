import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { Plus, Trash2, Bell, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { RemedyEventsApi, type RemedyEventInput } from '@/lib/api/remedyEvents.api'
import { CustomersApi } from '@/lib/api/customers.api'
import { qk } from '@/lib/query/keys'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatDateTime } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'
import type { RemedyEvent } from '@/types/remedyEvent'

// ──────────────────────────────────────────────
// Create Remedy Modal
// ──────────────────────────────────────────────

const EMPTY_FORM: RemedyEventInput = {
  customerId: '',
  orderId: '',
  remedyName: '',
  notes: '',
  scheduledAt: '',
}

function CreateRemedyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<RemedyEventInput>(EMPTY_FORM)
  const [customerSearch, setCustomerSearch] = useState('')

  const { data: customerData } = useQuery({
    queryKey: qk.customers.list({ search: customerSearch, limit: 20 }),
    queryFn: () => CustomersApi.list({ search: customerSearch, limit: 20 }),
    enabled: open,
  })

  const create = useMutation({
    mutationFn: (input: RemedyEventInput) =>
      RemedyEventsApi.create({
        ...input,
        orderId: input.orderId || undefined,
        notes: input.notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Remedy event created')
      qc.invalidateQueries({ queryKey: qk.remedyEvents.all() })
      setForm(EMPTY_FORM)
      onClose()
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  return (
    <Modal open={open} onClose={onClose} title="Add Remedy Event" size="md">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Search Client</label>
          <Input
            placeholder="Type client name or email…"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          {customerData && customerData.items.length > 0 && !form.customerId && (
            <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto">
              {customerData.items.map((c) => (
                <button
                  key={c._id}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 text-sm"
                  onClick={() => { setForm({ ...form, customerId: c._id }); setCustomerSearch(c.name) }}
                >
                  {c.name} · {c.email}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Remedy Name</label>
          <Input
            placeholder="e.g. Chant Gayatri Mantra"
            value={form.remedyName}
            onChange={(e) => setForm({ ...form, remedyName: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Scheduled Date &amp; Time</label>
          <Input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Notes (optional)</label>
          <Textarea
            placeholder="Any additional instructions…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Order Number (optional)</label>
          <Input
            placeholder="Order ID (MongoDB _id)"
            value={form.orderId}
            onChange={(e) => setForm({ ...form, orderId: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => create.mutate(form)}
          loading={create.isPending}
          disabled={!form.customerId || !form.remedyName || !form.scheduledAt}
        >
          Create Remedy
        </Button>
      </div>
    </Modal>
  )
}

// ──────────────────────────────────────────────
// Event Detail Modal
// ──────────────────────────────────────────────

function RemedyDetailModal({
  event,
  onClose,
  onDelete,
  deleting,
}: {
  event: RemedyEvent | null
  onClose: () => void
  onDelete: (id: string) => void
  deleting: boolean
}) {
  if (!event) return null
  const customer = typeof event.customerId === 'object' ? event.customerId : null

  return (
    <Modal open={!!event} onClose={onClose} title="Remedy Details">
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-400">Client</p>
          <p className="font-medium">{customer?.name ?? '—'} {customer?.email ? `(${customer.email})` : ''}</p>
        </div>
        <div>
          <p className="text-gray-400">Remedy</p>
          <p className="font-semibold text-gray-900">{event.remedyName}</p>
        </div>
        <div>
          <p className="text-gray-400">Scheduled</p>
          <p className="font-medium">{formatDateTime(event.scheduledAt)}</p>
        </div>
        {event.notes && (
          <div>
            <p className="text-gray-400">Notes</p>
            <p className="text-gray-700">{event.notes}</p>
          </div>
        )}
        <div>
          <p className="text-gray-400">Reminder Status</p>
          {event.reminderSentAt ? (
            <p className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14} /> Sent at {formatDateTime(event.reminderSentAt)}</p>
          ) : (
            <p className="text-amber-600 flex items-center gap-1"><Bell size={14} /> Pending</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button
          variant="danger"
          onClick={() => onDelete(event._id)}
          loading={deleting}
          leftIcon={<Trash2 size={14} />}
        >
          Delete
        </Button>
      </div>
    </Modal>
  )
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────

export function RemedyEventsPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<RemedyEvent | null>(null)
  const [filters] = useState({ limit: 200 })

  const { data } = useQuery({
    queryKey: qk.remedyEvents.list(filters),
    queryFn: () => RemedyEventsApi.list(filters),
  })

  const remove = useMutation({
    mutationFn: (id: string) => RemedyEventsApi.remove(id),
    onSuccess: () => {
      toast.success('Remedy event deleted')
      qc.invalidateQueries({ queryKey: qk.remedyEvents.all() })
      setSelectedEvent(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const calendarEvents = (data?.items ?? []).map((e) => {
    const customer = typeof e.customerId === 'object' ? e.customerId : null
    return {
      id: e._id,
      title: `${e.remedyName}${customer ? ` — ${customer.name}` : ''}`,
      start: e.scheduledAt,
      backgroundColor: e.reminderSentAt ? '#16a34a' : '#d97706',
      borderColor: e.reminderSentAt ? '#16a34a' : '#d97706',
      extendedProps: { event: e },
    }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Remedy Events</h1>
        <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus size={14} />}>
          New Remedy
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-amber-500" /> Pending reminder</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-600" /> Reminder sent</span>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek',
          }}
          events={calendarEvents}
          eventClick={(info) => setSelectedEvent(info.event.extendedProps.event as RemedyEvent)}
          height="auto"
        />
      </div>

      <CreateRemedyModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <RemedyDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={remove.mutate}
        deleting={remove.isPending}
      />
    </div>
  )
}
