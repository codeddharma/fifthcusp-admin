export interface CustomerOrder {
  _id: string
  orderNumber: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

export interface CustomerActivityEntry {
  at: string
  type: string
  message: string
  refModel?: string
  refId?: string
  meta?: Record<string, unknown>
}

export interface Customer {
  _id: string
  customerId: string
  email: string
  name: string
  phone: string
  notes?: string
  birthDate?: string
  anniversaryDate?: string
  orders: CustomerOrder[]
  activityLog?: CustomerActivityEntry[]
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerInput {
  email: string
  name: string
  phone: string
  notes?: string
  birthDate?: string
  anniversaryDate?: string
}

export interface UpdateCustomerInput {
  name?: string
  phone?: string
  notes?: string
  birthDate?: string
  anniversaryDate?: string
}
