export interface FaqItem {
  question: string
  answer: string
  isActive: boolean
}

export interface Faq {
  _id: string
  page: string
  faqs: FaqItem[]
  createdAt: string
  updatedAt: string
}

export interface FaqInput {
  page: string
  faqs: FaqItem[]
}
