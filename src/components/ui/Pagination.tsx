import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 text-xs text-shell-muted">
      <span>{total} total</span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} /> Prev
        </Button>
        <span>
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
