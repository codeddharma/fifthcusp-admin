export interface ConsultationEvent {
  _id: string
  orderId: string | { _id: string; orderNumber: string }
  customerId: string | { _id: string; name: string; email: string }
  bookingTokenId: string
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  googleEventId: string
  meetLink: string
  emailSentAt?: string
  createdAt: string
  updatedAt: string
}

export interface ConsultationEventFilters {
  from?: string
  to?: string
  customerId?: string
  page?: number
  limit?: number
}
