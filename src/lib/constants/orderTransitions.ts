import type { OrderStatus, PaymentStatus } from '@/types/order'

/**
 * Allowed order status transitions — mirrors the backend state machine in
 * `order.service.ts`. Used for UX (disabling invalid options); the backend
 * still enforces these rules.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  created: ['scheduled', 'in_progress', 'on_hold', 'cancelled'],
  scheduled: ['in_progress', 'on_hold', 'cancelled'],
  in_progress: ['on_hold', 'completed', 'cancelled'],
  on_hold: ['in_progress', 'completed', 'cancelled'],
  completed: ['awaiting_feedback', 'closed'],
  awaiting_feedback: ['closed'],
  closed: [],
  cancelled: [],
}

/** Statuses that may only be entered once payment is completed. */
export const REQUIRES_PAID = new Set<OrderStatus>([
  'scheduled',
  'in_progress',
  'completed',
  'awaiting_feedback',
  'closed',
])

/** The statuses an order may move to right now, given its current status and payment state. */
export function allowedNextStatuses(current: OrderStatus, paymentStatus: PaymentStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current].filter((s) => !(REQUIRES_PAID.has(s) && paymentStatus !== 'paid'))
}
