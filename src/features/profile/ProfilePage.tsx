import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { AuthApi } from '@/lib/api/auth.api'
import { useAuth } from '@/lib/auth/useAuth'
import { toApiError } from '@/lib/api/errors'
import { Badge } from '@/components/ui/Badge'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(8),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })

type Values = z.infer<typeof schema>

export function ProfilePage() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Values) {
    setSubmitting(true)
    try {
      await AuthApi.changePassword(values.currentPassword, values.newPassword)
      toast.success('Password updated')
      reset()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <h1 className="text-xl font-semibold text-shell-heading">My profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-shell-muted">Name</dt>
          <dd>{user?.name}</dd>
          <dt className="text-shell-muted">Email</dt>
          <dd>{user?.email}</dd>
          <dt className="text-shell-muted">Role</dt>
          <dd>
            <Badge tone="brand">{user?.role}</Badge>
          </dd>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Current password" error={errors.currentPassword?.message} required>
            <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
          </FormField>
          <FormField label="New password" error={errors.newPassword?.message} required hint="Minimum 8 characters">
            <Input type="password" autoComplete="new-password" {...register('newPassword')} />
          </FormField>
          <FormField label="Confirm new password" error={errors.confirm?.message} required>
            <Input type="password" autoComplete="new-password" {...register('confirm')} />
          </FormField>
          <div>
            <Button type="submit" loading={submitting}>
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
