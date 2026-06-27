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

export type Action = 'read' | 'write' | 'delete'

type Matrix = Record<Resource, Record<Action, UserRole[]>>

const ALL: UserRole[] = ['admin', 'manager', 'employee']

export const PERMISSIONS: Matrix = {
  users: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  services: { read: ALL, write: ['admin'], delete: ['admin'] },
  orders: { read: ['admin'], write: ['admin'], delete: ['admin'] },
  customers: { read: ['admin'], write: ['admin'], delete: ['admin'] },
  blogs: { read: ALL, write: ['admin'], delete: ['admin'] },
  faqs: { read: ALL, write: ['admin'], delete: ['admin'] },
  testimonials: { read: ALL, write: ['admin'], delete: ['admin'] },
  careers: { read: ALL, write: ['admin'], delete: ['admin'] },
  content: { read: ['admin', 'manager'], write: ['admin', 'manager'], delete: ['admin'] },
  pageMeta: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  coupons: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  paymentLinks: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
  consultationEvents: { read: ['admin', 'manager'], write: ['admin', 'manager'], delete: ['admin', 'manager'] },
  remedyEvents: { read: ['admin', 'manager'], write: ['admin', 'manager'], delete: ['admin', 'manager'] },
  calendarEvents: { read: ['admin', 'manager'], write: ['admin', 'manager'], delete: ['admin', 'manager'] },
  disclaimerBanner: { read: ['admin', 'manager'], write: ['admin'], delete: ['admin'] },
}

export function can(role: UserRole | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false
  return PERMISSIONS[resource][action].includes(role)
}
