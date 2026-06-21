import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BlogsApi } from '@/lib/api/blogs.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Tabs } from '@/components/ui/Tabs'
import { FormField } from '@/components/forms/FormField'
import { TagInput } from '@/components/forms/TagInput'
import { RichTextEditor } from '@/components/forms/RichTextEditor'
import { toApiError } from '@/lib/api/errors'
import { toSlug } from '@/lib/utils/slug'

const schema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().url().optional().or(z.literal('')),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  readTime: z.coerce.number().int().min(1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).default([]),
})

type Values = z.infer<typeof schema>

export function BlogFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: id ? qk.blogs.detail(id) : ['blogs', 'detail', 'new'],
    queryFn: () => BlogsApi.get(id!),
    enabled: isEdit,
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      category: '',
      tags: [],
      readTime: 5,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
    },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt,
        content: existing.content,
        coverImage: existing.coverImage ?? '',
        category: existing.category,
        tags: existing.tags ?? [],
        readTime: existing.readTime,
        metaTitle: existing.metaTitle ?? '',
        metaDescription: existing.metaDescription ?? '',
        metaKeywords: existing.metaKeywords ?? [],
      })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: Values) =>
      BlogsApi.create({ ...v, coverImage: v.coverImage || undefined }),
    onSuccess: () => {
      toast.success('Blog created')
      qc.invalidateQueries({ queryKey: qk.blogs.all() })
      navigate('/blogs')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: Values) =>
      BlogsApi.update(id!, { ...v, coverImage: v.coverImage || undefined }),
    onSuccess: () => {
      toast.success('Blog updated')
      qc.invalidateQueries({ queryKey: qk.blogs.all() })
      navigate('/blogs')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  if (isEdit && isLoading) return null
  const submitting = create.isPending || update.isPending
  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit blog' : 'New blog'}</CardTitle>
        </CardHeader>

        <form
          onSubmit={form.handleSubmit((v) => (isEdit ? update.mutate(v) : create.mutate(v)))}
          className="flex flex-col gap-4"
        >
          <FormField label="Title" required error={errs.title?.message}>
            <Input
              {...form.register('title')}
              onBlur={(e) => {
                if (!form.getValues('slug')) {
                  form.setValue('slug', toSlug(e.target.value))
                }
              }}
            />
          </FormField>

          <FormField label="Slug" required error={errs.slug?.message} hint="Lowercase letters, numbers and dashes">
            <Input {...form.register('slug')} />
          </FormField>

          <FormField label="Excerpt" required error={errs.excerpt?.message}>
            <Textarea rows={2} {...form.register('excerpt')} />
          </FormField>

          <FormField label="Content (HTML)" required error={errs.content?.message}>
            <Controller
              name="content"
              control={form.control}
              render={({ field }) => <HtmlContentEditor value={field.value} onChange={field.onChange} />}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Category" required error={errs.category?.message}>
              <Input {...form.register('category')} />
            </FormField>
            <FormField label="Read time (minutes)" required error={errs.readTime?.message}>
              <Input type="number" min={1} {...form.register('readTime', { valueAsNumber: true })} />
            </FormField>
          </div>

          <FormField label="Cover image URL" error={errs.coverImage?.message}>
            <Input type="url" {...form.register('coverImage')} placeholder="https://…" />
          </FormField>

          <FormField label="Tags" hint="Press Enter or comma to add">
            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </FormField>

          <h3 className="mt-2 text-sm font-semibold text-shell-heading">SEO</h3>
          <FormField label="Meta title">
            <Input {...form.register('metaTitle')} />
          </FormField>
          <FormField label="Meta description">
            <Textarea rows={2} {...form.register('metaDescription')} />
          </FormField>
          <FormField label="Meta keywords">
            <Controller
              name="metaKeywords"
              control={form.control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </FormField>

          {isEdit && existing ? (
            <div className="flex items-center justify-between rounded-md bg-shell-bg p-3">
              <span className="text-sm text-shell-muted">Currently {existing.isPublished ? 'published' : 'draft'}</span>
              <Switch
                checked={existing.isPublished}
                onChange={async (next) => {
                  try {
                    if (next) await BlogsApi.publish(id!)
                    else await BlogsApi.unpublish(id!)
                    toast.success(next ? 'Published' : 'Unpublished')
                    qc.invalidateQueries({ queryKey: qk.blogs.all() })
                  } catch (e) {
                    toast.error(toApiError(e).message)
                  }
                }}
                label={existing.isPublished ? 'Published' : 'Draft'}
              />
            </div>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/blogs')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Save changes' : 'Create blog'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function HtmlContentEditor({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const [tab, setTab] = useState<'rich' | 'source'>('rich')

  return (
    <div className="flex flex-col gap-2">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'rich', label: 'Rich editor' },
          { key: 'source', label: 'Source HTML' },
        ]}
      />

      {tab === 'rich' ? (
        <RichTextEditor value={value} onChange={onChange} />
      ) : (
        <Textarea
          rows={20}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
          placeholder="<p>Write raw HTML here…</p>"
        />
      )}
    </div>
  )
}
