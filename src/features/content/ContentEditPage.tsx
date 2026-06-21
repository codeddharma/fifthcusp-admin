import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { ContentApi } from '@/lib/api/content.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'
import { SectionList } from './components/SectionList'

export function ContentEditPage() {
  const { page } = useParams<{ page: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: qk.content.detail(page!),
    queryFn: () => ContentApi.getAdmin(page!),
    enabled: !!page,
  })

  useEffect(() => {
    if (data) {
      setMetaTitle(data.metaTitle)
      setMetaDescription(data.metaDescription)
      setSlug(data.slug)
    }
  }, [data])

  const updateMeta = useMutation({
    mutationFn: (partial: { metaTitle?: string; metaDescription?: string; slug?: string; isPublished?: boolean }) =>
      ContentApi.updateMeta(page!, partial),
    onSuccess: () => {
      toast.success('Saved')
      qc.invalidateQueries({ queryKey: qk.content.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const reorder = useMutation({
    mutationFn: (order: string[]) => ContentApi.reorderSections(page!, order),
    onMutate: async (order) => {
      await qc.cancelQueries({ queryKey: qk.content.detail(page!) })
      const prev = qc.getQueryData(qk.content.detail(page!))
      qc.setQueryData(qk.content.detail(page!), (old: any) => {
        if (!old) return old
        const map = new Map(old.sections.map((s: any) => [s.key, s]))
        return { ...old, sections: order.map((k, i) => ({ ...(map.get(k) ?? {}), order: i })) }
      })
      return { prev }
    },
    onError: (e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.content.detail(page!), ctx.prev)
      toast.error(toApiError(e).message)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.content.detail(page!) }),
  })

  const deleteSection = useMutation({
    mutationFn: (key: string) => ContentApi.deleteSection(page!, key),
    onSuccess: () => {
      toast.success('Section deleted')
      qc.invalidateQueries({ queryKey: qk.content.detail(page!) })
      setPendingDelete(null)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link to="/content" className="text-sm text-shell-muted hover:text-shell-text">
          ← Pages
        </Link>
        <Switch
          checked={data.isPublished}
          onChange={(next) => updateMeta.mutate({ isPublished: next })}
          label={data.isPublished ? 'Published' : 'Draft'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <code>{data.page}</code> — meta
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3">
          <FormField label="Slug">
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </FormField>
          <FormField label="Meta title">
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </FormField>
          <FormField label="Meta description">
            <Textarea rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
          </FormField>
          <div>
            <Button
              loading={updateMeta.isPending}
              onClick={() => updateMeta.mutate({ slug, metaTitle, metaDescription })}
            >
              Save meta
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections ({data.sections.length})</CardTitle>
          <Button size="sm" onClick={() => navigate(`/content/${data.page}/sections/new`)}>
            <Plus size={14} /> Add section
          </Button>
        </CardHeader>
        <SectionList
          sections={data.sections}
          onReorder={(order) => reorder.mutate(order)}
          onEdit={(key) => navigate(`/content/${data.page}/sections/${key}`)}
          onDelete={(key) => setPendingDelete(key)}
        />
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteSection.mutate(pendingDelete)}
        title="Delete section"
        description={`Delete section "${pendingDelete}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteSection.isPending}
      />
    </div>
  )
}
