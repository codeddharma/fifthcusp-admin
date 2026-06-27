export interface DisclaimerBanner {
  _id: string
  text: string
  isActive: boolean
  backgroundColor: string
  textColor: string
  createdAt: string
  updatedAt: string
}

export interface DisclaimerBannerInput {
  text: string
  isActive?: boolean
  backgroundColor?: string
  textColor?: string
}
