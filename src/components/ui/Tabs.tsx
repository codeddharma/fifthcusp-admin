import { ReactNode } from 'react'
import clsx from 'clsx'

export interface TabItem<T extends string = string> {
  key: T
  label: ReactNode
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (next: T) => void
}

export function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-shell-border">
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={t.key === value}
          onClick={() => onChange(t.key)}
          className={clsx(
            'focus-ring -mb-px border-b-2 px-3 py-2 text-sm font-medium',
            t.key === value
              ? 'border-brand-deep text-brand-deep'
              : 'border-transparent text-shell-muted hover:text-shell-text',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
