import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { toApiError } from '@/lib/api/errors'
import { DisclaimerBannerApi } from '@/lib/api/disclaimerBanner.api'

const schema = z.object({
  text: z.string().min(1, 'Banner text is required'),
  isActive: z.boolean().default(true),
  backgroundColor: z.string().min(1, 'Required'),
  textColor: z.string().min(1, 'Required'),
})

type Values = z.infer<typeof schema>

export function DisclaimerBannerPage() {
  const qc = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['disclaimerBanner'],
    queryFn: () => DisclaimerBannerApi.get(),
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: '',
      isActive: true,
      backgroundColor: '#d4af37',
      textColor: '#1a0033',
    },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        text: existing.text,
        isActive: existing.isActive,
        backgroundColor: existing.backgroundColor,
        textColor: existing.textColor,
      })
    }
  }, [existing, form])

  const update = useMutation({
    mutationFn: (v: Values) => DisclaimerBannerApi.update(v),
    onSuccess: () => {
      toast.success('Disclaimer banner saved')
      qc.invalidateQueries({ queryKey: ['disclaimerBanner'] })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold text-shell-heading">Disclaimer banner</h1>

      <Card>
        <CardHeader>
          <CardTitle>Header scrolling banner</CardTitle>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit((v) => update.mutate(v))}
          className="flex flex-col gap-4"
        >
          <FormField
            label="Banner text"
            required
            error={errs.text?.message}
            hint="Scrolls continuously across the top of every page, above the navigation bar"
          >
            <Input {...form.register('text')} placeholder="e.g. Disclaimer: All readings are for guidance purposes only." />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Background color" required error={errs.backgroundColor?.message}>
              <Input type="color" className="h-10 w-full p-1" {...form.register('backgroundColor')} />
            </FormField>
            <FormField label="Text color" required error={errs.textColor?.message}>
              <Input type="color" className="h-10 w-full p-1" {...form.register('textColor')} />
            </FormField>
          </div>

          <Switch
            label="Active (visible on the public site)"
            checked={form.watch('isActive')}
            onChange={(v) => form.setValue('isActive', v)}
          />

          <div className="mt-2 flex justify-end">
            <Button type="submit" loading={isLoading || update.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
