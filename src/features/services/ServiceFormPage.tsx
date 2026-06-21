import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ServicesApi } from '@/lib/api/services.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { TagInput } from '@/components/forms/TagInput'
import { toApiError } from '@/lib/api/errors'
import { serviceSchema, type ServiceFormParsed, type ServiceFormValues } from '@/lib/forms/schemas/service.schema'
import { SERVICE_TYPES } from '@/types/service'
import { PAGE_KEYS } from '@/lib/constants/pages'
import { FormInputsFieldArray } from './components/FormInputsFieldArray'
import { FileUploadsFieldArray } from './components/FileUploadsFieldArray'
import { AddOnsFieldArray } from './components/AddOnsFieldArray'

const DEFAULTS: ServiceFormValues = {
  sku: '',
  title: '',
  subtitle: '',
  description: '',
  price: 0,
  type: 'basic',
  pages: [],
  formInputs: [],
  fileUploads: [],
  addOns: [],
  repeatableGroup: undefined,
  isInSale: false,
  saleTitle: '',
  hasSaleBanner: false,
  discountPercentage: 0,
  isActiveService: true,
  deliveryDays: 7,
  requiresConsultation: false,
  consultationDurationMinutes: 60,
  requiresOutputFile: false,
  feedbackEmailEnabled: false,
}

function withDerivedOrder(parsed: ServiceFormParsed): ServiceFormParsed {
  return {
    ...parsed,
    formInputs: parsed.formInputs.map((f, i) => ({ ...f, order: i })),
    fileUploads: parsed.fileUploads.map((f, i) => ({ ...f, order: i })),
    addOns: parsed.addOns.map((a) => ({
      ...a,
      formInputs: a.formInputs.map((f, i) => ({ ...f, order: i })),
      fileUploads: a.fileUploads.map((f, i) => ({ ...f, order: i })),
    })),
  }
}

export function ServiceFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: id ? qk.services.detail(id) : ['services', 'detail', 'new'],
    queryFn: () => ServicesApi.get(id!),
    enabled: isEdit,
  })

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as never,
    defaultValues: DEFAULTS,
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        sku: existing.sku,
        title: existing.title,
        subtitle: existing.subtitle,
        description: existing.description,
        price: existing.price,
        type: existing.type,
        pages: existing.pages,
        formInputs: existing.formInputs,
        fileUploads: existing.fileUploads,
        addOns: existing.addOns,
        repeatableGroup: existing.repeatableGroup,
        isInSale: existing.isInSale,
        saleTitle: existing.saleTitle ?? '',
        hasSaleBanner: existing.hasSaleBanner,
        discountPercentage: existing.discountPercentage,
        isActiveService: existing.isActiveService,
        deliveryDays: existing.deliveryDays ?? 7,
        requiresConsultation: existing.requiresConsultation ?? false,
        consultationDurationMinutes: existing.consultationDurationMinutes ?? 60,
        requiresOutputFile: existing.requiresOutputFile ?? false,
        feedbackEmailEnabled: existing.feedbackEmailEnabled ?? false,
      })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: ServiceFormParsed) => ServicesApi.create(withDerivedOrder(v)),
    onSuccess: () => {
      toast.success('Service created')
      qc.invalidateQueries({ queryKey: qk.services.all() })
      navigate('/services')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: ServiceFormParsed) => ServicesApi.update(id!, withDerivedOrder(v)),
    onSuccess: () => {
      toast.success('Service updated')
      qc.invalidateQueries({ queryKey: qk.services.all() })
      navigate('/services')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  if (isEdit && isLoading) return null
  const submitting = create.isPending || update.isPending
  const errs = form.formState.errors

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <form
          onSubmit={form.handleSubmit(
            (v) => (isEdit ? update.mutate(v as ServiceFormParsed) : create.mutate(v as ServiceFormParsed)),
          )}
          className="flex flex-col gap-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit service' : 'New service'}</CardTitle>
            </CardHeader>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="SKU" required error={errs.sku?.message} hint="Auto-uppercased on save">
                <Input
                  {...form.register('sku', {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase()
                    },
                  })}
                  placeholder="ASTRO-BASIC-01"
                />
              </FormField>
              <FormField label="Price (₹)" required error={errs.price?.message}>
                <Input type="number" min={0} {...form.register('price', { valueAsNumber: true })} />
              </FormField>
              <FormField label="Title" required error={errs.title?.message} className="col-span-2">
                <Input {...form.register('title')} />
              </FormField>
              <FormField label="Subtitle" required error={errs.subtitle?.message} className="col-span-2">
                <Input {...form.register('subtitle')} />
              </FormField>
              <FormField label="Description" required error={errs.description?.message} className="col-span-2">
                <Textarea rows={4} {...form.register('description')} />
              </FormField>
              <FormField label="Type" required error={errs.type?.message}>
                <Select {...form.register('type')}>
                  {SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Discount %" error={errs.discountPercentage?.message}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  {...form.register('discountPercentage', { valueAsNumber: true })}
                />
              </FormField>
              <FormField label="Pages" required error={errs.pages?.message} className="col-span-2">
                <Controller
                  name="pages"
                  control={form.control as never}
                  render={({ field }) => (
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={`e.g. ${PAGE_KEYS.slice(0, 3).join(', ')}…`}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
              <Checkbox label="Active service" {...form.register('isActiveService')} />
              <Checkbox label="In sale" {...form.register('isInSale')} />
              <Checkbox label="Has sale banner" {...form.register('hasSaleBanner')} />
            </div>

            <FormField label="Sale title" className="mt-3">
              <Input {...form.register('saleTitle')} />
            </FormField>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery &amp; notifications</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Delivery days"
                hint="SLA from payment — deadline shown in admin dashboard"
                error={(errs as Record<string, { message?: string }>).deliveryDays?.message}
              >
                <Input
                  type="number"
                  min={1}
                  {...form.register('deliveryDays', { valueAsNumber: true })}
                />
              </FormField>
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <Checkbox
                label="Requires consultation (sends scheduling email on payment)"
                {...form.register('requiresConsultation')}
              />
              <Checkbox
                label="Requires output file (enables PDF upload in order panel)"
                {...form.register('requiresOutputFile')}
              />
              <Checkbox
                label="Request customer feedback after completion"
                {...form.register('feedbackEmailEnabled')}
              />
            </div>
            {form.watch('requiresConsultation') && (
              <div className="mt-4 max-w-xs">
                <FormField label="Consultation Duration (minutes)" error={form.formState.errors.consultationDurationMinutes?.message}>
                  <Input
                    type="number"
                    min={15}
                    step={15}
                    {...form.register('consultationDurationMinutes', { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form inputs</CardTitle>
            </CardHeader>
            <FormInputsFieldArray name="formInputs" control={form.control as never} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File uploads</CardTitle>
            </CardHeader>
            <FileUploadsFieldArray name="fileUploads" control={form.control as never} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add-ons</CardTitle>
            </CardHeader>
            <AddOnsFieldArray control={form.control as never} />
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/services')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Save service' : 'Create service'}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
