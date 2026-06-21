export interface RemedyEvent {
  _id: string
  customerId: string | { _id: string; name: string; email: string }
  orderId?: string | { _id: string; orderNumber: string }
  remedyName: string
  notes?: string
  scheduledAt: string
  googleEventId: string
  reminderSentAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface RemedyEventFilters {
  from?: string
  to?: string
  customerId?: string
  page?: number
  limit?: number
}
