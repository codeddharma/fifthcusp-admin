import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        'focus-ring h-9 w-full rounded-md border bg-white px-3 text-sm text-shell-text placeholder:text-shell-dim',
        invalid ? 'border-danger' : 'border-shell-border',
        'disabled:bg-shell-bg disabled:text-shell-dim',
        className,
      )}
      {...rest}
    />
  )
})
