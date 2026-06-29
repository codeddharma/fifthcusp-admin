import type { UserRole } from '@/types/user'

export type Resource =
  | 'users'
  | 'services'
  | 'orders'
  | 'customers'
  | 'blogs'
  | 'faqs'
  | 'testimonials'
  | 'careers'
  | 'content'
  | 'pageMeta'
  | 'coupons'
  | 'paymentLinks'
  | 'consultationEvents'
  | 'remedyEvents'
  | 'calendarEvents'
  | 'disclaimerBanner'
  | 'notepad'

export type Action = 'read' | 'write' | 'delete'

type Matrix = Record<Resource, Record<Action, UserRole[]>>

const ALL: UserRole[] = ['admin', 'manager', 'employee']

export const PERMISSIONS: Matrix = {
  users: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  services: { read: ALL, write: ['admin'], delete: ['admin'] },
  orders: { read: ['admin', 'employee'], write: ['admin', 'employee'], delete: ['admin'] },
  customers: { read: ['admin'], write: ['admin'], delete: ['admin'] },
  blogs: { read: ALL, write: ['admin'], delete: ['admin'] },
  faqs: { read: ALL, write: ['admin'], delete: ['admin'] },
  testimonials: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  careers: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  content: { read: ['admin', 'manager'], write: ['admin', 'manager'], delete: ['admin'] },
  pageMeta: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  coupons: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  paymentLinks: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  consultationEvents: { read: ALL, write: ['admin', 'manager'], delete: ['admin', 'manager'] },
  remedyEvents: { read: ALL, write: ALL, delete: ['admin', 'manager'] },
  calendarEvents: { read: ALL, write: ['admin', 'manager'], delete: ['admin', 'manager'] },
  disclaimerBanner: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  notepad: { read: ALL, write: ALL, delete: ALL },
}

export function can(role: UserRole | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false
  return PERMISSIONS[resource][action].includes(role)
}
