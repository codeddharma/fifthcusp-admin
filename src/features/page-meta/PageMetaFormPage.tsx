import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageMetaApi } from '@/lib/api/pageMeta.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/forms/FormField'
import { TagInput } from '@/components/forms/TagInput'
import { toApiError } from '@/lib/api/errors'

const KNOWN_PAGES = ['/', '/astrology', '/energy', '/vastu', '/manifestation', '/wealth', '/tarot-reading', '/careers']

const schema = z.object({
  pagePath: z.string().min(1, 'Page path is required'),
  metaTitle: z.string().min(1, 'Meta title is required').max(70),
  metaDescription: z.string().min(1, 'Meta description is required').max(160),
  metaKeywords: z.array(z.string()),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type Values = z.infer<typeof schema>

export function PageMetaFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: all } = useQuery({
    queryKey: qk.pageMeta.list(),
    queryFn: () => PageMetaApi.list(),
  })

  const existing = isEdit ? all?.find((p) => p._id === id) : undefined

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { pagePath: '', metaTitle: '', metaDescription: '', metaKeywords: [], ogTitle: '', ogDescription: '', ogImageUrl: '' },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        pagePath: existing.pagePath,
        metaTitle: existing.metaTitle,
        metaDescription: existing.metaDescription,
        metaKeywords: existing.metaKeywords ?? [],
        ogTitle: existing.ogTitle ?? '',
        ogDescription: existing.ogDescription ?? '',
        ogImageUrl: existing.ogImageUrl ?? '',
      })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: Values) => PageMetaApi.create(v),
    onSuccess: () => {
      toast.success('Page meta created')
      qc.invalidateQueries({ queryKey: qk.pageMeta.all() })
      navigate('/page-meta')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: Values) => PageMetaApi.update(id!, v),
    onSuccess: () => {
      toast.success('Page meta updated')
      qc.invalidateQueries({ queryKey: qk.pageMeta.all() })
      navigate('/page-meta')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/page-meta" className="text-sm text-shell-muted hover:text-shell-text">
        ← Page SEO Meta
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit page meta' : 'New page meta'}</CardTitle>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit((v) => (isEdit ? update.mutate(v) : create.mutate(v)))}
          className="flex flex-col gap-4"
        >
          <FormField label="Page" required error={errs.pagePath?.message}>
            {isEdit ? (
              <Input {...form.register('pagePath')} disabled />
            ) : (
              <Select {...form.register('pagePath')}>
                <option value="">Select a page…</option>
                {KNOWN_PAGES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField label="Meta title" required hint="Max 70 characters" error={errs.metaTitle?.message}>
            <Input {...form.register('metaTitle')} maxLength={70} />
          </FormField>

          <FormField label="Meta description" required hint="Max 160 characters" error={errs.metaDescription?.message}>
            <Textarea rows={3} {...form.register('metaDescription')} maxLength={160} />
          </FormField>

          <FormField label="Keywords" hint="Press Enter or comma to add">
            <Controller
              name="metaKeywords"
              control={form.control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </FormField>

          <div className="border-t border-shell-border pt-4">
            <p className="mb-3 text-sm font-medium text-shell-muted">Open Graph (optional)</p>
            <div className="flex flex-col gap-3">
              <FormField label="OG title" error={errs.ogTitle?.message}>
                <Input {...form.register('ogTitle')} />
              </FormField>
              <FormField label="OG description" error={errs.ogDescription?.message}>
                <Textarea rows={2} {...form.register('ogDescription')} />
              </FormField>
              <FormField label="OG image URL" error={errs.ogImageUrl?.message}>
                <Input {...form.register('ogImageUrl')} placeholder="https://…" />
              </FormField>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/page-meta')}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
