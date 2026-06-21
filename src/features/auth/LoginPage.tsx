import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { useAuth } from '@/lib/auth/useAuth'
import { toApiError } from '@/lib/api/errors'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/dashboard'
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: LoginValues) {
    setSubmitting(true)
    try {
      await login(values.email, values.password)
      navigate(decodeURIComponent(next))
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-lg font-semibold text-shell-heading">Sign in</h1>
      <p className="mb-6 text-sm text-shell-muted">Use your admin credentials to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Email" error={errors.email?.message} required>
          <Input type="email" autoComplete="email" autoFocus invalid={!!errors.email} {...register('email')} />
        </FormField>
        <FormField label="Password" error={errors.password?.message} required>
          <Input type="password" autoComplete="current-password" invalid={!!errors.password} {...register('password')} />
        </FormField>
        <Button type="submit" loading={submitting} size="lg">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
