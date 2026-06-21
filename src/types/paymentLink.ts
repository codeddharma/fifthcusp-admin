export type PaymentLinkStatus = 'pending' | 'paid' | 'cancelled' | 'expired'

export interface PaymentLink {
  _id: string
  token: string
  customerId: string | { _id: string; name: string; email: string; customerId: string }
  serviceId?: string | { _id: string; title: string; sku: string }
  customServiceDescription?: string
  amount: number
  description: string
  validUntil: string
  status: PaymentLinkStatus
  notes?: string
  paidAt?: string
  linkedOrderId?: string
  prefillName: string
  prefillEmail: string
  prefillPhone: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentLinkInput {
  customerId: string
  serviceId?: string
  customServiceDescription?: string
  amount: number
  description: string
  validUntil: string
  notes?: string
}
