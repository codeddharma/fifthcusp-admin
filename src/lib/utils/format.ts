import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(iso: string | undefined, pattern = 'd MMM yyyy'): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), pattern)
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string | undefined): string {
  return formatDate(iso, 'd MMM yyyy, HH:mm')
}

export function timeAgo(iso: string | undefined): string {
  if (!iso) return ''
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`
}
