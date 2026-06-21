import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, EyeOff } from 'lucide-react'
import { FaqsApi } from '@/lib/api/faqs.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FormField } from '@/components/forms/FormField'
import { Tabs } from '@/components/ui/Tabs'
import { toApiError } from '@/lib/api/errors'
import { PAGE_KEYS } from '@/lib/constants/pages'

const schema = z.object({
  page: z.string().min(1),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1, 'Required'),
        answer: z.string().min(1, 'Required'),
        isActive: z.boolean(),
      }),
    )
    .min(1, 'At least one question'),
})

type Values = z.infer<typeof schema>

export function FaqFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  const { data: existing, isLoading } = useQuery({
    queryKey: id ? qk.faqs.detail(id) : ['faqs', 'detail', 'new'],
    queryFn: () => FaqsApi.get(id!),
    enabled: isEdit,
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { page: '', faqs: [{ question: '', answer: '', isActive: true }] },
  })

  const fields = useFieldArray({ control: form.control, name: 'faqs' })

  useEffect(() => {
    if (existing) {
      form.reset({ page: existing.page, faqs: existing.faqs })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: Values) => FaqsApi.create(v),
    onSuccess: () => {
      toast.success('FAQ created')
      qc.invalidateQueries({ queryKey: qk.faqs.all() })
      navigate('/faqs')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: Values) => FaqsApi.update(id!, v),
    onSuccess: () => {
      toast.success('FAQ updated')
      qc.invalidateQueries({ queryKey: qk.faqs.all() })
      navigate('/faqs')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const draft = form.watch()

  if (isEdit && isLoading) return null
  const submitting = create.isPending || update.isPending
  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit FAQ group' : 'New FAQ group'}</CardTitle>
        </CardHeader>

        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'edit', label: 'Edit' },
            { key: 'preview', label: `Preview (${draft.faqs?.length ?? 0})` },
          ]}
        />

        {tab === 'edit' ? (
          <form
            onSubmit={form.handleSubmit((v) => (isEdit ? update.mutate(v) : create.mutate(v)))}
            className="mt-4 flex flex-col gap-4"
          >
            <FormField label="Page key" required error={errs.page?.message} hint="Lowercase, unique per page">
              <Input
                {...form.register('page')}
                placeholder={PAGE_KEYS.join(' / ')}
                disabled={isEdit}
              />
            </FormField>

            <div className="flex flex-col gap-3">
              {fields.fields.map((field, idx) => (
                <div key={field.id} className="rounded-md border border-shell-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-shell-muted">Question #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fields.remove(idx)}
                      aria-label="Remove"
                      disabled={fields.fields.length === 1}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <FormField label="Question" required error={errs.faqs?.[idx]?.question?.message}>
                    <Input {...form.register(`faqs.${idx}.question`)} />
                  </FormField>
                  <FormField label="Answer" required error={errs.faqs?.[idx]?.answer?.message} className="mt-3">
                    <Textarea rows={3} {...form.register(`faqs.${idx}.answer`)} />
                  </FormField>
                  <div className="mt-3">
                    <Checkbox label="Active" {...form.register(`faqs.${idx}.isActive`)} />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => fields.append({ question: '', answer: '', isActive: true })}
              >
                <Plus size={14} /> Add question
              </Button>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/faqs')}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                {isEdit ? 'Save changes' : 'Create'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-xs text-shell-muted">
              Preview of your current draft. Inactive items appear dimmed and would be hidden on the public site.
              {draft.page ? (
                <>
                  {' '}
                  Page: <code className="text-shell-text">{draft.page}</code>
                </>
              ) : null}
            </p>
            {draft.faqs?.length ? (
              draft.faqs.map((f, i) => (
                <div
                  key={i}
                  className={
                    'rounded-md border p-3 ' +
                    (f.isActive ? 'border-shell-border bg-white' : 'border-shell-border bg-shell-bg opacity-60')
                  }
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{f.question || <em className="text-shell-muted">Untitled question</em>}</p>
                    {!f.isActive ? (
                      <Badge tone="warning">
                        <EyeOff size={10} /> Hidden
                      </Badge>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-line text-sm text-shell-muted">
                    {f.answer || <em>No answer yet</em>}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-shell-muted">No questions yet. Add some in the Edit tab.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
