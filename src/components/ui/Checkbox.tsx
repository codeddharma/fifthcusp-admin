import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, ...rest },
  ref,
) {
  return (
    <label className={clsx('inline-flex items-center gap-2 text-sm text-shell-text', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="focus-ring h-4 w-4 rounded border-shell-border text-brand-deep"
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </label>
  )
})
