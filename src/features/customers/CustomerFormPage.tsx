import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CustomersApi } from '@/lib/api/customers.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'

const schema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(7, 'At least 7 digits').max(20),
  notes: z.string().optional(),
  birthDate: z.string().optional(),
  anniversaryDate: z.string().optional(),
})

type Values = z.infer<typeof schema>

export function CustomerFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '', phone: '', notes: '', birthDate: '', anniversaryDate: '' },
  })

  const create = useMutation({
    mutationFn: (v: Values) => CustomersApi.create(v),
    onSuccess: () => {
      toast.success('Customer created')
      qc.invalidateQueries({ queryKey: qk.customers.all() })
      navigate('/customers')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/customers" className="text-sm text-shell-muted hover:text-shell-text">
        ← Customers
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>New customer</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit((v) => create.mutate(v))} className="flex flex-col gap-4">
          <FormField label="Email" required error={errs.email?.message}>
            <Input type="email" autoComplete="off" {...form.register('email')} />
          </FormField>
          <FormField label="Name" required error={errs.name?.message}>
            <Input {...form.register('name')} />
          </FormField>
          <FormField label="Phone" required error={errs.phone?.message}>
            <Input {...form.register('phone')} />
          </FormField>
          <FormField label="Birth date" error={errs.birthDate?.message}>
            <Input type="date" {...form.register('birthDate')} />
          </FormField>
          <FormField label="Anniversary date" error={errs.anniversaryDate?.message}>
            <Input type="date" {...form.register('anniversaryDate')} />
          </FormField>
          <FormField label="Internal notes" hint="Visible to admins only" error={errs.notes?.message}>
            <Textarea rows={3} {...form.register('notes')} />
          </FormField>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              Create customer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
