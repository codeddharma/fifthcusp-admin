import { ReactNode } from 'react'
import clsx from 'clsx'

interface FormFieldProps {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ label, htmlFor, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-xs font-medium text-shell-text">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-shell-muted">{hint}</span>
      ) : null}
    </div>
  )
}
