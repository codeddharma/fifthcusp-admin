import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { Plus, Trash2, ExternalLink, Clock, Settings2, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { ConsultationEventsApi } from '@/lib/api/consultationEvents.api'
import { AvailabilityWindowsApi, type AvailabilityWindowInput } from '@/lib/api/availabilityWindows.api'
import { qk } from '@/lib/query/keys'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { formatDateTime } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'
import { DAY_NAMES, type AvailabilityWindow } from '@/types/availabilityWindow'
import type { ConsultationEvent } from '@/types/consultationEvent'
import { useAuth } from '@/lib/auth/useAuth'

type Tab = 'calendar' | 'availability'

// ──────────────────────────────────────────────
// Availability Settings Panel
// ──────────────────────────────────────────────

function AvailabilityPanel() {
  const qc = useQueryClient()
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState<AvailabilityWindowInput>({ dayOfWeek: 1, startHour: 10, endHour: 18 })

  const { data: windows = [], isLoading } = useQuery({
    queryKey: qk.availabilityWindows.list(),
    queryFn: () => AvailabilityWindowsApi.list(),
  })

  const create = useMutation({
    mutationFn: (input: AvailabilityWindowInput) => AvailabilityWindowsApi.create(input),
    onSuccess: () => {
      toast.success('Availability window added')
      qc.invalidateQueries({ queryKey: qk.availabilityWindows.all() })
      setAddModal(false)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const toggle = useMutation({
    mutationFn: (w: AvailabilityWindow) => AvailabilityWindowsApi.update(w._id, { isActive: !w.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.availabilityWindows.all() }),
    onError: (e) => toast.error(toApiError(e).message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => AvailabilityWindowsApi.remove(id),
    onSuccess: () => {
      toast.success('Window removed')
      qc.invalidateQueries({ queryKey: qk.availabilityWindows.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const grouped = DAY_NAMES.map((name, dow) => ({
    name,
    dow,
    windows: windows.filter((w) => w.dayOfWeek === dow),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Set the days and hours when consultations can be booked.</p>
        <Button size="sm" onClick={() => setAddModal(true)} leftIcon={<Plus size={14} />}>
          Add Window
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ name, windows: ws }) => (
            <div key={name} className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-700 mb-2">{name}</p>
              {ws.length === 0 ? (
                <p className="text-sm text-gray-400">No availability set</p>
              ) : (
                <div className="space-y-2">
                  {ws.map((w) => (
                    <div key={w._id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 border">
                      <Clock size={14} className="text-purple-400" />
                      <span className="text-sm text-gray-700 flex-1">
                        {String(w.startHour).padStart(2, '0')}:00 – {String(w.endHour).padStart(2, '0')}:00
                      </span>
                      <Switch
                        checked={w.isActive}
                        onChange={() => toggle.mutate(w)}
                        label=""
                      />
                      <button
                        onClick={() => remove.mutate(w._id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Availability Window">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Day of Week</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
            >
              {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">Start Hour (0–23)</label>
              <Input
                type="number"
                min={0}
                max={23}
                value={form.startHour}
                onChange={(e) => setForm({ ...form, startHour: Number(e.target.value) })}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">End Hour (1–24)</label>
              <Input
                type="number"
                min={1}
                max={24}
                value={form.endHour}
                onChange={(e) => setForm({ ...form, endHour: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button>
          <Button
            onClick={() => create.mutate(form)}
            loading={create.isPending}
          >
            Add
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ──────────────────────────────────────────────
// Event Detail Modal
// ──────────────────────────────────────────────

function EventDetailModal({
  event,
  onClose,
  onDelete,
  deleting,
  canDelete,
}: {
  event: ConsultationEvent | null
  onClose: () => void
  onDelete: (id: string) => void
  deleting: boolean
  canDelete: boolean
}) {
  if (!event) return null
  const customer = typeof event.customerId === 'object' ? event.customerId : null
  const order = typeof event.orderId === 'object' ? event.orderId : null

  return (
    <Modal open={!!event} onClose={onClose} title="Consultation Details">
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-400">Client</p>
          <p className="font-medium">{customer?.name ?? '—'} {customer?.email ? `(${customer.email})` : ''}</p>
        </div>
        <div>
          <p className="text-gray-400">Order</p>
          <p className="font-medium">#{order?.orderNumber ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-400">Time</p>
          <p className="font-medium">{formatDateTime(event.startTime)} – {formatDateTime(event.endTime)}</p>
        </div>
        <div>
          <p className="text-gray-400">Duration</p>
          <p className="font-medium">{event.durationMinutes} minutes</p>
        </div>
        <div>
          <p className="text-gray-400">Google Meet Link</p>
          <a href={event.meetLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 flex items-center gap-1 break-all">
            {event.meetLink} <ExternalLink size={12} />
          </a>
        </div>
        <div>
          <p className="text-gray-400">Email Sent</p>
          <p className="font-medium">{event.emailSentAt ? formatDateTime(event.emailSentAt) : 'Not sent yet'}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {canDelete && (
          <Button
            variant="danger"
            onClick={() => onDelete(event._id)}
            loading={deleting}
            leftIcon={<Trash2 size={14} />}
          >
            Cancel Event
          </Button>
        )}
      </div>
    </Modal>
  )
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────

export function ConsultationEventsPage() {
  const { user } = useAuth()
  const canDelete = user?.role === 'admin' || user?.role === 'manager'
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('calendar')
  const [selectedEvent, setSelectedEvent] = useState<ConsultationEvent | null>(null)
  const [filters] = useState({ limit: 200 })

  const { data } = useQuery({
    queryKey: qk.consultationEvents.list(filters),
    queryFn: () => ConsultationEventsApi.list(filters),
  })

  const remove = useMutation({
    mutationFn: (id: string) => ConsultationEventsApi.remove(id),
    onSuccess: () => {
      toast.success('Consultation event cancelled')
      qc.invalidateQueries({ queryKey: qk.consultationEvents.all() })
      setSelectedEvent(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const calendarEvents = (data?.items ?? []).map((e) => {
    const customer = typeof e.customerId === 'object' ? e.customerId : null
    return {
      id: e._id,
      title: customer ? `${customer.name}` : e.title,
      start: e.startTime,
      end: e.endTime,
      backgroundColor: '#7c3aed',
      borderColor: '#7c3aed',
      extendedProps: { event: e },
    }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
        <div className="flex gap-2">
          <Button
            variant={tab === 'calendar' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTab('calendar')}
            leftIcon={<CalendarDays size={14} />}
          >
            Calendar
          </Button>
          <Button
            variant={tab === 'availability' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTab('availability')}
            leftIcon={<Settings2 size={14} />}
          >
            Availability
          </Button>
        </div>
      </div>

      {tab === 'availability' ? (
        <AvailabilityPanel />
      ) : (
        <div className="bg-white rounded-2xl shadow p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listWeek',
            }}
            events={calendarEvents}
            eventClick={(info) => {
              setSelectedEvent(info.event.extendedProps.event as ConsultationEvent)
            }}
            height="auto"
          />
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={remove.mutate}
        deleting={remove.isPending}
        canDelete={canDelete}
      />
    </div>
  )
}
