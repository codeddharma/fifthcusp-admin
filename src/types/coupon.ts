export interface Coupon {
  _id: string
  code: string
  description?: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  maxDiscount?: number
  minOrderAmount: number
  maxUses: number
  usedCount: number
  validFrom?: string
  expiresAt?: string
  isActive: boolean
  applicableCustomerIds: string[]
  applicableServiceIds: string[]
  isBirthdayOffer: boolean
  isAnniversaryOffer: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCouponInput {
  code: string
  description?: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  maxDiscount?: number
  minOrderAmount?: number
  maxUses?: number
  validFrom?: string
  expiresAt?: string
  isActive?: boolean
  applicableCustomerIds?: string[]
  applicableServiceIds?: string[]
  isBirthdayOffer?: boolean
  isAnniversaryOffer?: boolean
}
