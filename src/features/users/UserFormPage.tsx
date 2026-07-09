import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UsersApi } from '@/lib/api/users.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'
import { USER_SPECIALTIES, SPECIALTY_VALUES, type Specialty } from '@/lib/constants/specialties'

const specialtiesField = z.array(z.enum(SPECIALTY_VALUES)).default([])

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'employee']),
  password: z.string().min(8, 'At least 8 characters'),
  isActive: z.boolean().default(true),
  specialties: specialtiesField,
})

const editSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'employee']),
  isActive: z.boolean(),
  specialties: specialtiesField,
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

export function UserFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: id ? qk.users.detail(id) : ['users', 'detail', 'new'],
    queryFn: () => UsersApi.get(id!),
    enabled: isEdit,
  })

  const form = useForm<CreateValues | EditValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit
      ? { name: '', email: '', role: 'employee', isActive: true, specialties: [] }
      : { name: '', email: '', role: 'employee', password: '', isActive: true, specialties: [] },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        name: existing.name,
        email: existing.email,
        role: existing.role,
        isActive: existing.isActive,
        specialties: existing.specialties ?? [],
      })
    }
  }, [existing, form])

  const role = form.watch('role')

  function toggleSpecialty(value: Specialty) {
    const current = form.getValues('specialties') ?? []
    form.setValue('specialties', current.includes(value) ? current.filter((t) => t !== value) : [...current, value])
  }

  const create = useMutation({
    mutationFn: (v: CreateValues) =>
      UsersApi.create({ name: v.name, email: v.email, role: v.role, password: v.password, specialties: v.specialties }),
    onSuccess: () => {
      toast.success('User created')
      qc.invalidateQueries({ queryKey: qk.users.all() })
      navigate('/users')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: EditValues) => UsersApi.update(id!, v),
    onSuccess: () => {
      toast.success('User updated')
      qc.invalidateQueries({ queryKey: qk.users.all() })
      navigate('/users')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  function onSubmit(values: CreateValues | EditValues) {
    if (isEdit) update.mutate(values as EditValues)
    else create.mutate(values as CreateValues)
  }

  if (isEdit && isLoading) return null

  const submitting = create.isPending || update.isPending
  const errs = form.formState.errors as Record<string, { message?: string } | undefined>

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit user' : 'New user'}</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Name" required error={errs.name?.message}>
            <Input {...form.register('name')} />
          </FormField>
          <FormField label="Email" required error={errs.email?.message}>
            <Input type="email" {...form.register('email')} />
          </FormField>
          <FormField label="Role" required error={errs.role?.message}>
            <Select {...form.register('role')}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </Select>
          </FormField>
          {!isEdit ? (
            <FormField label="Password" required error={errs.password?.message} hint="Minimum 8 characters">
              <Input type="password" autoComplete="new-password" {...form.register('password' as 'password')} />
            </FormField>
          ) : null}
          <Checkbox label="Active" {...form.register('isActive')} />

          {role === 'employee' && (
            <div className="border-t border-shell-border pt-4">
              <p className="mb-2 text-sm font-medium text-shell-muted">
                Specialties (which call/order types this employee can be assigned)
              </p>
              <div className="flex flex-col gap-1">
                {USER_SPECIALTIES.map(({ value, label }) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(form.watch('specialties') ?? []).includes(value)}
                      onChange={() => toggleSpecialty(value)}
                      className="rounded border-shell-border"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Save changes' : 'Create user'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
