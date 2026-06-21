import { KeyboardEvent, useState } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  uppercase?: boolean
  invalid?: boolean
}

export function TagInput({ value, onChange, placeholder = 'Type and press Enter…', uppercase, invalid }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function commit() {
    const v = draft.trim()
    if (!v) return
    const normalized = uppercase ? v.toUpperCase() : v
    if (!value.includes(normalized)) onChange([...value, normalized])
    setDraft('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={clsx(
        'flex min-h-9 flex-wrap items-center gap-1 rounded-md border bg-white px-2 py-1',
        invalid ? 'border-danger' : 'border-shell-border',
      )}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-shell-bg px-2 py-0.5 text-xs">
          {tag}
          <button
            type="button"
            className="text-shell-muted hover:text-danger"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={value.length ? '' : placeholder}
        className="focus-ring h-7 flex-1 min-w-[8ch] bg-transparent text-sm outline-none placeholder:text-shell-dim"
      />
    </div>
  )
}
