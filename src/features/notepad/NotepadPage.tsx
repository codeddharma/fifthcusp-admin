import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Save } from 'lucide-react'
import { InternalNotesApi } from '@/lib/api/internalNotes.api'
import { qk } from '@/lib/query/keys'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'
import type { InternalNote } from '@/types/internalNote'

function NoteCard({ note }: { note: InternalNote }) {
  const qc = useQueryClient()
  const [content, setContent] = useState(note.content)
  const dirty = content !== note.content

  const update = useMutation({
    mutationFn: () => InternalNotesApi.update(note._id, content),
    onSuccess: () => {
      toast.success('Note saved')
      qc.invalidateQueries({ queryKey: qk.internalNotes.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const remove = useMutation({
    mutationFn: () => InternalNotesApi.remove(note._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.internalNotes.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  return (
    <Card className="flex flex-col gap-2">
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-shell-muted">Last updated {formatDateTime(note.updatedAt)}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Trash2 size={14} />}
            onClick={() => remove.mutate()}
            loading={remove.isPending}
          >
            Delete
          </Button>
          <Button
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={() => update.mutate()}
            disabled={!dirty || !content.trim()}
            loading={update.isPending}
          >
            Save
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function NotepadPage() {
  const qc = useQueryClient()

  const { data: notes, isLoading } = useQuery({
    queryKey: qk.internalNotes.list(),
    queryFn: () => InternalNotesApi.list(),
  })

  const create = useMutation({
    mutationFn: () => InternalNotesApi.create('New note'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.internalNotes.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shell-heading">Notepad</h1>
        <p className="text-sm text-shell-muted">Private to you — no one else can see these notes.</p>
      </div>

      <Button onClick={() => create.mutate()} loading={create.isPending} leftIcon={<Plus size={14} />}>
        New note
      </Button>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-shell-muted">No notes yet — add one above.</p>
      )}
    </div>
  )
}
