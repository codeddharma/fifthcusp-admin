import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { PageSection } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Props {
  sections: PageSection[]
  onReorder: (orderedKeys: string[]) => void
  onEdit: (key: string) => void
  onDelete: (key: string) => void
}

export function SectionList({ sections, onReorder, onEdit, onDelete }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.key === active.id)
    const newIdx = sections.findIndex((s) => s.key === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const next = arrayMove(sections, oldIdx, newIdx)
    onReorder(next.map((s) => s.key))
  }

  if (!sections.length) {
    return <p className="text-sm text-shell-muted">No sections yet. Add one to get started.</p>
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <SortableContext items={sections.map((s) => s.key)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {sections.map((s) => (
            <SortableRow
              key={s.key}
              section={s}
              onEdit={() => onEdit(s.key)}
              onDelete={() => onDelete(s.key)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({
  section,
  onEdit,
  onDelete,
}: {
  section: PageSection
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border border-shell-border bg-white p-3"
    >
      <button
        type="button"
        className="cursor-grab text-shell-dim hover:text-shell-muted"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <code className="text-xs text-shell-muted">{section.key}</code>
          {!section.isVisible ? <Badge tone="warning">Hidden</Badge> : null}
        </div>
        <div className="truncate text-sm font-medium">{section.title}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit section">
        <Pencil size={14} />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete section">
        <Trash2 size={14} />
      </Button>
    </li>
  )
}
