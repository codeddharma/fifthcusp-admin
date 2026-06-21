import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ContentApi } from '@/lib/api/content.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Spinner } from '@/components/ui/Spinner'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'

export function SectionEditPage() {
  const { page, key } = useParams<{ page: string; key: string }>()
  const isNew = key === 'new'
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: qk.content.detail(page!),
    queryFn: () => ContentApi.getAdmin(page!),
    enabled: !!page,
  })

  const existing = useMemo(() => data?.sections.find((s) => s.key === key), [data, key])

  const [editedKey, setEditedKey] = useState('')
  const [title, setTitle] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [jsonText, setJsonText] = useState('{}')
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew && existing) {
      setEditedKey(existing.key)
      setTitle(existing.title)
      setIsVisible(existing.isVisible)
      setJsonText(JSON.stringify(existing.data ?? {}, null, 2))
    } else if (isNew) {
      setEditedKey('')
      setTitle('')
      setIsVisible(true)
      setJsonText('{}')
    }
  }, [isNew, existing])

  const save = useMutation({
    mutationFn: async () => {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonText)
      } catch (e) {
        throw new Error(`Invalid JSON: ${(e as Error).message}`)
      }
      const targetKey = isNew ? editedKey : existing!.key
      if (!targetKey) throw new Error('Section key is required')
      return ContentApi.upsertSection(page!, targetKey, {
        title,
        isVisible,
        data: parsed,
        order: existing?.order ?? (data?.sections.length ?? 0),
      })
    },
    onSuccess: () => {
      toast.success('Section saved')
      qc.invalidateQueries({ queryKey: qk.content.detail(page!) })
      navigate(`/content/${page}/edit`)
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  function onJsonChange(v: string) {
    setJsonText(v)
    try {
      JSON.parse(v)
      setJsonError(null)
    } catch (e) {
      setJsonError((e as Error).message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!data) return null
  if (!isNew && !existing) return <p className="text-sm text-shell-muted">Section not found.</p>

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link to={`/content/${page}/edit`} className="text-sm text-shell-muted hover:text-shell-text">
        ← Back to {page}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? 'New section' : `Edit section: ${existing?.key}`}</CardTitle>
        </CardHeader>

        <div className="flex flex-col gap-3">
          {isNew ? (
            <FormField
              label="Section key"
              required
              hint="Lowercase identifier (e.g. hero, services, faqs). Cannot be changed later."
            >
              <Input value={editedKey} onChange={(e) => setEditedKey(e.target.value.toLowerCase())} />
            </FormField>
          ) : null}
          <FormField label="Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <Switch checked={isVisible} onChange={setIsVisible} label="Visible on site" />
          <FormField
            label="Data (JSON)"
            required
            error={jsonError ?? undefined}
            hint="Structured content for this section. Schema is free-form."
          >
            <Textarea
              rows={16}
              value={jsonText}
              onChange={(e) => onJsonChange(e.target.value)}
              className="font-mono text-xs"
              invalid={!!jsonError}
            />
          </FormField>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate(`/content/${page}/edit`)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} loading={save.isPending} disabled={!!jsonError}>
              Save section
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
