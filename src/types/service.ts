export type ServiceType =
  | 'basic'
  | 'advanced'
  | 'practice'
  | 'numerology'
  | 'consultation'
  | 'reports_basic'
  | 'reports_advanced'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'phonenumber'
  | 'dropdown'
  | 'multiSelect'
  | 'radio'
  | 'date'
  | 'number'
  | 'checkbox'

export const SERVICE_TYPES: ServiceType[] = [
  'basic',
  'advanced',
  'practice',
  'numerology',
  'consultation',
  'reports_basic',
  'reports_advanced',
]

export const ASTROLOGY_TYPES: ServiceType[] = ['numerology', 'consultation', 'reports_basic', 'reports_advanced']

export const GENERIC_TYPES: ServiceType[] = ['basic', 'advanced', 'practice']

export const FIELD_TYPES: FieldType[] = [
  'text',
  'textarea',
  'email',
  'password',
  'phonenumber',
  'dropdown',
  'multiSelect',
  'radio',
  'date',
  'number',
  'checkbox',
]

export interface FormInputValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  minDate?: string
  maxDate?: string
  min?: number
  max?: number
}

export interface FormInput {
  fieldKey: string
  label: string
  type: FieldType
  isRequired: boolean
  placeholder?: string
  tooltip?: string
  options?: string[]
  validation?: FormInputValidation
  order: number
}

export interface FileUploadField {
  fieldKey: string
  label: string
  tooltip?: string
  acceptedTypes: string[]
  maxFiles: number
  maxFileSizeMB: number
  isRequired: boolean
  order: number
}

export interface ServicePage {
  page: string
  order: number
}

export interface ServiceAddOn {
  key: string
  label: string
  description?: string
  price: number
  formInputs: FormInput[]
  fileUploads: FileUploadField[]
}

export interface RepeatableGroup {
  enabled: boolean
  label: string
  maxRepeats: number
}

export interface Service {
  _id: string
  sku: string
  title: string
  subtitle: string
  description: string
  price: number
  type: ServiceType
  pages: ServicePage[]
  formInputs: FormInput[]
  fileUploads: FileUploadField[]
  addOns: ServiceAddOn[]
  repeatableGroup?: RepeatableGroup
  isInSale: boolean
  saleTitle?: string
  hasSaleBanner: boolean
  discountPercentage: number
  isActiveService: boolean
  soldCount: number
  lastSoldDate?: string
  deliveryDays: number
  requiresConsultation: boolean
  consultationDurationMinutes: number
  requiresOutputFile: boolean
  feedbackEmailEnabled: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceInput = Omit<Service, '_id' | 'soldCount' | 'lastSoldDate' | 'createdAt' | 'updatedAt'>
