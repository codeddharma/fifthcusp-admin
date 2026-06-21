import type { FieldType } from './service'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderStatus = 'created' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'awaiting_feedback' | 'closed' | 'cancelled'
export type FileCompression = 'none' | 'sharp-jpeg' | 'sharp-webp' | 'gzip'

export const ORDER_STATUSES: OrderStatus[] = ['created', 'scheduled', 'in_progress', 'on_hold', 'completed', 'awaiting_feedback', 'closed', 'cancelled']
export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']

export interface FormResponseEntry {
  fieldKey: string
  label: string
  type: FieldType
  value: unknown
  addOnKey?: string
}

export interface OrderAddOn {
  key: string
  label: string
  price: number
}

export interface OrderFile {
  fieldKey: string
  addOnKey?: string
  originalName: string
  storedName: string
  mimeType: string
  originalSizeBytes: number
  storedSizeBytes: number
  compression: FileCompression
  path: string
  uploadedAt: string
}

export interface OutputFile {
  originalName: string
  storedPath: string
  uploadedAt: string
  uploadedBy: string
}

export interface OrderPricing {
  basePrice: number
  addOnsTotal: number
  discountPercentage: number
  discountAmount: number
  couponCode?: string
  couponDiscount: number
  subtotal: number
  finalAmount: number
  currency: string
}

export interface ServiceSnapshot {
  title: string
  type: string
  basePrice: number
  discountPercentage: number
}

export interface StatusHistoryEntry {
  at: string
  by?: string
  from: OrderStatus
  to: OrderStatus
  note?: string
}

export interface TimelineEntry {
  at: string
  type: string
  message: string
  actor?: string
  meta?: Record<string, unknown>
}

export interface OrderConsultation {
  scheduledAt: string
  endTime: string
  meetLink: string
  googleEventId: string
  bookedAt: string
}

export interface Order {
  _id: string
  orderNumber: string
  customerId: string | { _id: string; name: string; email: string; phone: string }
  serviceId: string | { _id: string; title: string; requiresOutputFile?: boolean; feedbackEmailEnabled?: boolean; requiresConsultation?: boolean; deliveryDays?: number }
  serviceSku: string
  serviceSnapshot: ServiceSnapshot
  quantity: number
  formResponses: FormResponseEntry[]
  selectedAddOns: OrderAddOn[]
  fileUploads: OrderFile[]
  pricing: OrderPricing
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  statusHistory: StatusHistoryEntry[]
  timeline?: TimelineEntry[]
  consultation?: OrderConsultation
  filesPurgedAt?: string
  deadline?: string
  outputFiles: OutputFile[]
  feedbackToken?: string
  feedbackEmailSentAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderListFilters {
  paymentStatus?: PaymentStatus
  orderStatus?: OrderStatus
  serviceSku?: string
  customerEmail?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}
