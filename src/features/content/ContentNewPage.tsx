import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ContentApi } from '@/lib/api/content.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'
import { toSlug } from '@/lib/utils/slug'

const schema = z.object({
  page: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers and dashes only'),
  slug: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  isPublished: z.boolean(),
})

type Values = z.infer<typeof schema>

export function ContentNewPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { page: '', slug: '', metaTitle: '', metaDescription: '', isPublished: false },
  })

  const create = useMutation({
    mutationFn: (v: Values) => ContentApi.create(v),
    onSuccess: (created) => {
      toast.success('Page created')
      qc.invalidateQueries({ queryKey: qk.content.all() })
      navigate(`/content/${created.page}/edit`)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>New page</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit((v) => create.mutate(v))} className="flex flex-col gap-4">
          <FormField label="Page key" required error={errs.page?.message} hint="Lowercase, used in /content/:page URLs">
            <Input
              {...form.register('page')}
              onBlur={(e) => {
                if (!form.getValues('slug')) form.setValue('slug', toSlug(e.target.value))
              }}
            />
          </FormField>
          <FormField label="Slug" required error={errs.slug?.message}>
            <Input {...form.register('slug')} />
          </FormField>
          <FormField label="Meta title" required error={errs.metaTitle?.message}>
            <Input {...form.register('metaTitle')} />
          </FormField>
          <FormField label="Meta description" required error={errs.metaDescription?.message}>
            <Textarea rows={2} {...form.register('metaDescription')} />
          </FormField>
          <Checkbox label="Publish immediately" {...form.register('isPublished')} />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/content')}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              Create page
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
