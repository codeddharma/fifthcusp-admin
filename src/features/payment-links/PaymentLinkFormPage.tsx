import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Search } from 'lucide-react'
import { PaymentLinksApi } from '@/lib/api/paymentLinks.api'
import { CustomersApi } from '@/lib/api/customers.api'
import { ServicesApi } from '@/lib/api/services.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'
import type { Customer } from '@/types/customer'

const schema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceType: z.enum(['existing', 'custom']),
  serviceId: z.string().optional(),
  customServiceDescription: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  validUntil: z.string().min(1, 'Expiry is required'),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.serviceType === 'existing' && !data.serviceId) {
    ctx.addIssue({ code: 'custom', path: ['serviceId'], message: 'Select a service' })
  }
  if (data.serviceType === 'custom' && !data.customServiceDescription) {
    ctx.addIssue({ code: 'custom', path: ['customServiceDescription'], message: 'Description is required for custom service' })
  }
})

type Values = z.infer<typeof schema>

export function PaymentLinkFormPage() {
  const navigate = useNavigate()
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const { data: customersData } = useQuery({
    queryKey: qk.customers.list({ search: customerSearch }),
    queryFn: () => CustomersApi.list({ limit: 20, search: customerSearch }),
    enabled: customerSearch.length > 1,
  })

  const { data: services } = useQuery({
    queryKey: qk.services.list({ onlyActive: true }),
    queryFn: () => ServicesApi.list({ onlyActive: true }),
    // Always reflect the current catalog when the page opens (new services show up).
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: '',
      serviceType: 'existing',
      serviceId: '',
      customServiceDescription: '',
      amount: 0,
      description: '',
      validUntil: '',
      notes: '',
    },
  })

  const serviceType = form.watch('serviceType')

  const create = useMutation({
    mutationFn: (values: Values) =>
      PaymentLinksApi.create({
        customerId: values.customerId,
        serviceId: values.serviceType === 'existing' ? values.serviceId : undefined,
        customServiceDescription: values.serviceType === 'custom' ? values.customServiceDescription : undefined,
        amount: values.amount,
        description: values.description,
        validUntil: values.validUntil,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Payment link created')
      navigate('/payment-links')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const handleCustomerSelect = (c: Customer) => {
    setSelectedCustomer(c)
    form.setValue('customerId', c._id)
    setCustomerSearch(`${c.name} (${c.customerId})`)
    setShowCustomerDropdown(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link to="/payment-links" className="text-shell-muted hover:text-shell-text">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-semibold text-shell-heading">New Payment Link</h1>
      </div>

      <form onSubmit={form.handleSubmit((v) => create.mutate(v))} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <div className="p-4">
            <FormField label="Search customer" error={form.formState.errors.customerId?.message}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Search size={14} className="text-shell-muted" />
                </div>
                <input
                  type="text"
                  className="input pl-9 w-full"
                  placeholder="Search by name or email…"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setShowCustomerDropdown(true)
                    if (!e.target.value) {
                      setSelectedCustomer(null)
                      form.setValue('customerId', '')
                    }
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
                />
                {showCustomerDropdown && customersData && customersData.items.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-shell-border bg-shell-surface shadow-lg">
                    {customersData.items.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-shell-bg"
                        onMouseDown={() => handleCustomerSelect(c)}
                      >
                        <span className="font-medium text-shell-text">{c.name}</span>
                        <span className="text-shell-muted">{c.email}</span>
                        <span className="ml-auto font-mono text-xs text-shell-muted">{c.customerId}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedCustomer && (
                <p className="mt-1 text-xs text-shell-muted">
                  Selected: {selectedCustomer.name} · {selectedCustomer.email} · {selectedCustomer.phone}
                </p>
              )}
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-4 p-4">
            <FormField label="Service type">
              <Select
                {...form.register('serviceType')}
                onChange={(e) => {
                  form.setValue('serviceType', e.target.value as 'existing' | 'custom')
                  form.setValue('serviceId', '')
                  form.setValue('customServiceDescription', '')
                  form.setValue('amount', 0)
                }}
              >
                <option value="existing">Existing catalog service</option>
                <option value="custom">Custom description</option>
              </Select>
            </FormField>

            {serviceType === 'existing' ? (
              <FormField label="Service" error={form.formState.errors.serviceId?.message}>
                <Select
                  {...form.register('serviceId')}
                  onChange={(e) => {
                    const svc = services?.find((s) => s._id === e.target.value)
                    form.setValue('serviceId', e.target.value)
                    if (svc) form.setValue('amount', svc.price)
                  }}
                >
                  <option value="">— Select service —</option>
                  {services?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} (₹{s.price?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </Select>
              </FormField>
            ) : (
              <FormField
                label="Custom service description"
                error={form.formState.errors.customServiceDescription?.message}
              >
                <Input
                  {...form.register('customServiceDescription')}
                  placeholder="e.g. Tarot reading session — 30 min"
                />
              </FormField>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link Details</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-4 p-4">
            <FormField label="Amount (₹)" error={form.formState.errors.amount?.message}>
              <Input type="number" min={1} {...form.register('amount')} />
            </FormField>

            <FormField label="Description" error={form.formState.errors.description?.message}>
              <Input
                {...form.register('description')}
                placeholder="Brief description shown to customer"
              />
            </FormField>

            <FormField label="Expires at" error={form.formState.errors.validUntil?.message}>
              <Input type="datetime-local" {...form.register('validUntil')} />
            </FormField>

            <FormField label="Internal notes" error={form.formState.errors.notes?.message}>
              <Input {...form.register('notes')} placeholder="Optional notes for internal use" />
            </FormField>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create payment link'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/payment-links')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
