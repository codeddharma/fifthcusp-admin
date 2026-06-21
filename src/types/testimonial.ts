export interface Testimonial {
  _id: string
  feedback: string
  clientName: string
  services: string[]
  isApproved: boolean
  isRejected: boolean
  approvedAt?: string
  rejectedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TestimonialInput {
  feedback: string
  clientName: string
  services: string[]
}
