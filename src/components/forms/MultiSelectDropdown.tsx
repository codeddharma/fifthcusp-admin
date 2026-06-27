import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import clsx from 'clsx'

interface Option {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  options: Option[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  invalid?: boolean
}

export function MultiSelectDropdown({ options, value, onChange, placeholder = 'Select…', invalid }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  const selectedOptions = options.filter((o) => value.includes(o.value))

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'focus-ring flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-white px-2 py-1 text-left text-sm',
          invalid ? 'border-danger' : 'border-shell-border',
        )}
      >
        {selectedOptions.length ? (
          selectedOptions.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 rounded bg-shell-bg px-2 py-0.5 text-xs text-shell-text"
            >
              {o.label}
              <span
                role="button"
                tabIndex={-1}
                className="text-shell-muted hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(o.value)
                }}
                aria-label={`Remove ${o.label}`}
              >
                <X size={12} />
              </span>
            </span>
          ))
        ) : (
          <span className="text-shell-dim">{placeholder}</span>
        )}
        <ChevronDown size={14} className="ml-auto shrink-0 text-shell-muted" />
      </button>

      {open ? (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-md border border-shell-border bg-white py-1 shadow-lg">
          {options.map((o) => {
            const checked = value.includes(o.value)
            return (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-shell-text hover:bg-shell-bg"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  className="focus-ring h-4 w-4 rounded border-shell-border text-brand-deep"
                />
                {o.label}
              </label>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
