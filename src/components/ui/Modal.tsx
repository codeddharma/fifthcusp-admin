import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-shell-heading/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[calc(100dvh-2rem)] w-full ${sizeClass[size]} flex-col overflow-hidden rounded-xl bg-white shadow-modal`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-shell-border p-4">
          <h2 className="text-base font-semibold text-shell-heading">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring -m-1 rounded p-1 text-shell-muted hover:bg-shell-bg"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-shell-text scroll-thin">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-shell-border p-4">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
