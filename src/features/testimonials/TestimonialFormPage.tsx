import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TestimonialsApi } from '@/lib/api/testimonials.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FormField } from '@/components/forms/FormField'
import { TagInput } from '@/components/forms/TagInput'
import { toApiError } from '@/lib/api/errors'

const schema = z.object({
  clientName: z.string().min(1),
  feedback: z.string().min(1),
  services: z.array(z.string()).min(1, 'Add at least one service'),
})
type Values = z.infer<typeof schema>

export function TestimonialFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: id ? qk.testimonials.detail(id) : ['testimonials', 'detail', 'new'],
    queryFn: () => TestimonialsApi.get(id!),
    enabled: isEdit,
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { clientName: '', feedback: '', services: [] },
  })

  useEffect(() => {
    if (existing) {
      form.reset({ clientName: existing.clientName, feedback: existing.feedback, services: existing.services })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: Values) => TestimonialsApi.create(v),
    onSuccess: () => {
      toast.success('Created')
      qc.invalidateQueries({ queryKey: qk.testimonials.all() })
      navigate('/testimonials')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: Values) => TestimonialsApi.update(id!, v),
    onSuccess: () => {
      toast.success('Updated')
      qc.invalidateQueries({ queryKey: qk.testimonials.all() })
      navigate('/testimonials')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  if (isEdit && isLoading) return null
  const submitting = create.isPending || update.isPending
  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit testimonial' : 'New testimonial'}</CardTitle>
          {existing ? (
            existing.isApproved ? (
              <Badge tone="success">Approved</Badge>
            ) : existing.isRejected ? (
              <Badge tone="danger">Rejected</Badge>
            ) : (
              <Badge tone="warning">Pending</Badge>
            )
          ) : null}
        </CardHeader>

        <form
          onSubmit={form.handleSubmit((v) => (isEdit ? update.mutate(v) : create.mutate(v)))}
          className="flex flex-col gap-4"
        >
          <FormField label="Client name" required error={errs.clientName?.message}>
            <Input {...form.register('clientName')} />
          </FormField>
          <FormField label="Feedback" required error={errs.feedback?.message}>
            <Textarea rows={5} {...form.register('feedback')} />
          </FormField>
          <FormField label="Services" required error={errs.services?.message} hint="Press Enter or comma">
            <Controller
              name="services"
              control={form.control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </FormField>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/testimonials')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
