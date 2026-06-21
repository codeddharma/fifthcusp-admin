export type RecurringOrderStatus = 'active' | 'paused' | 'cancelled'
export type IntervalUnit = 'day' | 'week' | 'month'

export interface RecurringOrderGeneratedLink {
  _id: string
  token: string
  status: string
  amount: number
  validUntil: string
  paidAt?: string
}

export interface RecurringOrder {
  _id: string
  customerId: string | { _id: string; name: string; email: string; customerId: string }
  serviceId?: string | { _id: string; title: string; sku: string }
  customServiceDescription?: string
  amount: number
  description: string
  intervalUnit: IntervalUnit
  intervalCount: number
  linkValidityDays: number
  status: RecurringOrderStatus
  nextRunAt: string
  lastRunAt?: string
  generatedLinks: string[] | RecurringOrderGeneratedLink[]
  notes?: string
  prefillName: string
  prefillEmail: string
  prefillPhone: string
  createdAt: string
  updatedAt: string
}

export interface CreateRecurringOrderInput {
  customerId: string
  serviceId?: string
  customServiceDescription?: string
  amount: number
  description: string
  intervalUnit: IntervalUnit
  intervalCount: number
  linkValidityDays?: number
  notes?: string
  sendFirstNow?: boolean
}
