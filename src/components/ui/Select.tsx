import { SelectHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={clsx(
        'focus-ring h-9 w-full rounded-md border bg-white px-2 text-sm text-shell-text',
        invalid ? 'border-danger' : 'border-shell-border',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
})
