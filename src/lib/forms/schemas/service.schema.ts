import { z } from 'zod'

const fieldTypeEnum = z.enum([
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
])

const validationSchema = z
  .object({
    minLength: z.coerce.number().int().min(0).optional(),
    maxLength: z.coerce.number().int().min(1).optional(),
    pattern: z.string().optional(),
    minDate: z.string().optional(),
    maxDate: z.string().optional(),
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
  })
  .optional()

const formInputSchema = z.object({
  fieldKey: z.string().min(1, 'Required'),
  label: z.string().min(1, 'Required'),
  type: fieldTypeEnum,
  isRequired: z.boolean(),
  placeholder: z.string().optional(),
  tooltip: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation: validationSchema,
  order: z.coerce.number().int().min(0),
})

const fileUploadSchema = z.object({
  fieldKey: z.string().min(1),
  label: z.string().min(1),
  tooltip: z.string().optional(),
  acceptedTypes: z.array(z.string()).min(1, 'At least one accepted type'),
  maxFiles: z.coerce.number().int().min(1),
  maxFileSizeMB: z.coerce.number().min(0.1).max(100),
  isRequired: z.boolean(),
  order: z.coerce.number().int().min(0),
})

const addOnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  formInputs: z.array(formInputSchema).default([]),
  fileUploads: z.array(fileUploadSchema).default([]),
})

export const serviceSchema = z
  .object({
    sku: z.string().min(1).transform((v) => v.toUpperCase()),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    price: z.coerce.number().min(0),
    type: z.enum(['basic', 'advanced', 'practice', 'numerology', 'consultation', 'reports_basic', 'reports_advanced']),
    pages: z.array(z.string()).min(1, 'Select at least one page'),
    formInputs: z.array(formInputSchema).default([]),
    fileUploads: z.array(fileUploadSchema).default([]),
    addOns: z.array(addOnSchema).default([]),
    repeatableGroup: z
      .object({
        enabled: z.boolean(),
        label: z.string().min(1),
        maxRepeats: z.coerce.number().int().min(1).max(20),
      })
      .optional(),
    isInSale: z.boolean(),
    saleTitle: z.string().optional(),
    hasSaleBanner: z.boolean(),
    discountPercentage: z.coerce.number().min(0).max(100),
    isActiveService: z.boolean(),
    deliveryDays: z.coerce.number().int().min(1).default(7),
    requiresConsultation: z.boolean().default(false),
    consultationDurationMinutes: z.coerce.number().int().min(15).default(60),
    requiresOutputFile: z.boolean().default(false),
    feedbackEmailEnabled: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.pages.includes('astrology')) {
      const allowed = ['basic', 'advanced', 'practice', 'consultation', 'reports_basic', 'reports_advanced']
      if (!allowed.includes(data.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['type'],
          message: 'Astrology services must use basic/advanced/practice/consultation/reports_basic/reports_advanced',
        })
      }
    }
  })

export type ServiceFormValues = z.input<typeof serviceSchema>
export type ServiceFormParsed = z.output<typeof serviceSchema>
