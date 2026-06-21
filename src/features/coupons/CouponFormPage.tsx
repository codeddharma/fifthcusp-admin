import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CouponsApi } from '@/lib/api/coupons.api'
import { ServicesApi } from '@/lib/api/services.api'
import { CustomersApi } from '@/lib/api/customers.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'

const schema = z.object({
  code: z.string().min(1, 'Code is required').toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.coerce.number().positive('Must be positive'),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().min(0).optional(),
  validFrom: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
  applicableServiceIds: z.array(z.string()).optional(),
  applicableCustomerIds: z.array(z.string()).optional(),
  isBirthdayOffer: z.boolean().default(false),
  isAnniversaryOffer: z.boolean().default(false),
})

type Values = z.infer<typeof schema>

export function CouponFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: coupons } = useQuery({
    queryKey: qk.coupons.list({}),
    queryFn: () => CouponsApi.list({ limit: 200 }),
    enabled: isEdit,
  })
  const existing = isEdit ? coupons?.items.find((c) => c._id === id) : undefined

  const { data: servicesData } = useQuery({
    queryKey: qk.services.list({}),
    queryFn: () => ServicesApi.list(),
  })

  const { data: customersData } = useQuery({
    queryKey: qk.customers.list({}),
    queryFn: () => CustomersApi.list({ limit: 200 }),
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      maxUses: 0,
      validFrom: '',
      expiresAt: '',
      isActive: true,
      applicableServiceIds: [],
      applicableCustomerIds: [],
      isBirthdayOffer: false,
      isAnniversaryOffer: false,
    },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        code: existing.code,
        description: existing.description ?? '',
        discountType: existing.discountType,
        discountValue: existing.discountValue,
        minOrderAmount: existing.minOrderAmount,
        maxUses: existing.maxUses,
        validFrom: existing.validFrom ? existing.validFrom.slice(0, 10) : '',
        expiresAt: existing.expiresAt ? existing.expiresAt.slice(0, 10) : '',
        isActive: existing.isActive,
        applicableServiceIds: existing.applicableServiceIds ?? [],
        applicableCustomerIds: existing.applicableCustomerIds ?? [],
        isBirthdayOffer: existing.isBirthdayOffer,
        isAnniversaryOffer: existing.isAnniversaryOffer,
      })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: Values) => CouponsApi.create(v),
    onSuccess: () => {
      toast.success('Coupon created')
      qc.invalidateQueries({ queryKey: qk.coupons.all() })
      navigate('/coupons')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: Values) => CouponsApi.update(id!, v),
    onSuccess: () => {
      toast.success('Coupon updated')
      qc.invalidateQueries({ queryKey: qk.coupons.all() })
      navigate('/coupons')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const errs = form.formState.errors
  const services = servicesData ?? []
  const customers = customersData?.items ?? []

  function toggleId(field: 'applicableServiceIds' | 'applicableCustomerIds', id: string) {
    const current = form.getValues(field) ?? []
    form.setValue(
      field,
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/coupons" className="text-sm text-shell-muted hover:text-shell-text">
        ← Coupons
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit coupon' : 'New coupon'}</CardTitle>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit((v) => (isEdit ? update.mutate(v) : create.mutate(v)))}
          className="flex flex-col gap-4"
        >
          <FormField label="Code" required error={errs.code?.message} hint="Will be uppercased automatically">
            <Input {...form.register('code')} style={{ textTransform: 'uppercase' }} />
          </FormField>
          <FormField label="Description" error={errs.description?.message}>
            <Input {...form.register('description')} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Discount type" required error={errs.discountType?.message}>
              <Select {...form.register('discountType')}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat amount (₹)</option>
              </Select>
            </FormField>
            <FormField label="Discount value" required error={errs.discountValue?.message}>
              <Input type="number" min={0} step="0.01" {...form.register('discountValue')} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min order amount (₹)" error={errs.minOrderAmount?.message}>
              <Input type="number" min={0} {...form.register('minOrderAmount')} />
            </FormField>
            <FormField label="Max uses (0 = unlimited)" error={errs.maxUses?.message}>
              <Input type="number" min={0} {...form.register('maxUses')} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valid from" hint="Leave empty for immediate validity" error={errs.validFrom?.message}>
              <Input type="date" {...form.register('validFrom')} />
            </FormField>
            <FormField label="Expires at" hint="Leave empty for no expiry" error={errs.expiresAt?.message}>
              <Input type="date" {...form.register('expiresAt')} />
            </FormField>
          </div>

          <Switch
            label="Active"
            checked={form.watch('isActive')}
            onChange={(v) => form.setValue('isActive', v)}
          />

          <div className="border-t border-shell-border pt-4">
            <p className="mb-3 text-sm font-medium text-shell-muted">Special offers</p>
            <div className="flex flex-col gap-2">
              <Checkbox label="Birthday offer (valid only on customer's birthday)" {...form.register('isBirthdayOffer')} />
              <Checkbox label="Anniversary offer (valid only on customer's anniversary)" {...form.register('isAnniversaryOffer')} />
            </div>
          </div>

          {services.length > 0 && (
            <div className="border-t border-shell-border pt-4">
              <p className="mb-2 text-sm font-medium text-shell-muted">Restrict to services (empty = all services)</p>
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {services.map((svc) => (
                  <label key={svc._id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(form.watch('applicableServiceIds') ?? []).includes(svc._id)}
                      onChange={() => toggleId('applicableServiceIds', svc._id)}
                      className="rounded border-shell-border"
                    />
                    <span>{svc.title} <span className="text-shell-muted">({svc.sku})</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {customers.length > 0 && (
            <div className="border-t border-shell-border pt-4">
              <p className="mb-2 text-sm font-medium text-shell-muted">Restrict to customers (empty = all customers)</p>
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {customers.map((c) => (
                  <label key={c._id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(form.watch('applicableCustomerIds') ?? []).includes(c._id)}
                      onChange={() => toggleId('applicableCustomerIds', c._id)}
                      className="rounded border-shell-border"
                    />
                    <span>{c.name} <span className="text-shell-muted">{c.email}</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/coupons')}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {isEdit ? 'Save changes' : 'Create coupon'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
