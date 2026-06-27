import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarEventsApi } from '@/lib/api/calendarEvents.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { RichTextEditor } from '@/components/forms/RichTextEditor'
import { toApiError } from '@/lib/api/errors'
import { EVENT_TYPE_OPTIONS } from '@/types/calendarEvent'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  eventType: z.enum([
    'grahan',
    'solar-eclipse',
    'lunar-eclipse',
    'full-moon',
    'new-moon',
    'festival',
    'other',
  ]),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

type Values = z.infer<typeof schema>

export function CalendarEventFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: existing } = useQuery({
    queryKey: qk.calendarEvents.detail(id ?? ''),
    queryFn: () => CalendarEventsApi.get(id!),
    enabled: isEdit,
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      eventType: 'other',
      date: '',
      description: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        title: existing.title,
        eventType: existing.eventType,
        date: existing.date ? existing.date.slice(0, 10) : '',
        description: existing.description ?? '',
        isActive: existing.isActive,
      })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: Values) => CalendarEventsApi.create(v),
    onSuccess: () => {
      toast.success('Event created')
      qc.invalidateQueries({ queryKey: qk.calendarEvents.all() })
      navigate('/calendar-events')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: Values) => CalendarEventsApi.update(id!, v),
    onSuccess: () => {
      toast.success('Event updated')
      qc.invalidateQueries({ queryKey: qk.calendarEvents.all() })
      navigate('/calendar-events')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/calendar-events" className="text-sm text-shell-muted hover:text-shell-text">
        ← Calendar Events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit event' : 'New event'}</CardTitle>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit((v) => (isEdit ? update.mutate(v) : create.mutate(v)))}
          className="flex flex-col gap-4"
        >
          <FormField label="Title" required error={errs.title?.message} hint="Shown as the label on the public calendar">
            <Input {...form.register('title')} placeholder="e.g. Chandra Grahan (Lunar Eclipse)" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Event type" required error={errs.eventType?.message}>
              <Select {...form.register('eventType')}>
                {EVENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Date" required error={errs.date?.message}>
              <Input type="date" {...form.register('date')} />
            </FormField>
          </div>

          <FormField label="Description" error={errs.description?.message} hint="Shown when a visitor opens the event details">
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Shown when a visitor opens the event details"
                  minHeight="10rem"
                />
              )}
            />
          </FormField>

          <Switch
            label="Active (visible on the public calendar)"
            checked={form.watch('isActive')}
            onChange={(v) => form.setValue('isActive', v)}
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/calendar-events')}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {isEdit ? 'Save changes' : 'Create event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
