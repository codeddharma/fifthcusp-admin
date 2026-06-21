import clsx from 'clsx'

interface SwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={clsx('inline-flex items-center gap-2 text-sm', disabled && 'opacity-60')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'focus-ring relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-brand-deep' : 'bg-shell-border-strong',
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-1',
          )}
        />
      </button>
      {label ? <span>{label}</span> : null}
    </label>
  )
}
