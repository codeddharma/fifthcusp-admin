import { TextareaHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'focus-ring w-full rounded-md border bg-white px-3 py-2 text-sm text-shell-text placeholder:text-shell-dim',
        invalid ? 'border-danger' : 'border-shell-border',
        className,
      )}
      {...rest}
    />
  )
})
