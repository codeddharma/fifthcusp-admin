import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CareersApi } from '@/lib/api/careers.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { TagInput } from '@/components/forms/TagInput'
import { toApiError } from '@/lib/api/errors'
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from '@/types/career'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  experienceLevel: z.enum(['junior', 'mid', 'senior']),
  experienceYears: z.coerce.number().int().min(0),
  skills: z.array(z.string()).min(1),
  qualifications: z.array(z.string()).min(1),
  responsibilities: z.array(z.string()).min(1),
  salaryMin: z
    .union([z.coerce.number().min(0), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
  salaryMax: z
    .union([z.coerce.number().min(0), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
  applicationDeadline: z
    .union([z.string(), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? undefined : v)),
  isActive: z.boolean(),
})

type Values = z.infer<typeof schema>

export function CareerFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: id ? qk.careers.detail(id) : ['careers', 'detail', 'new'],
    queryFn: () => CareersApi.get(id!),
    enabled: isEdit,
  })

  const form = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: '',
      description: '',
      department: '',
      location: '',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      experienceYears: 0,
      skills: [],
      qualifications: [],
      responsibilities: [],
      salaryMin: undefined,
      salaryMax: undefined,
      applicationDeadline: undefined,
      isActive: true,
    },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        title: existing.title,
        description: existing.description,
        department: existing.department,
        location: existing.location,
        employmentType: existing.employmentType,
        experienceLevel: existing.experienceLevel,
        experienceYears: existing.experienceYears,
        skills: existing.skills,
        qualifications: existing.qualifications,
        responsibilities: existing.responsibilities,
        salaryMin: existing.salaryMin,
        salaryMax: existing.salaryMax,
        applicationDeadline: existing.applicationDeadline?.slice(0, 10),
        isActive: existing.isActive,
      })
    }
  }, [existing, form])

  const create = useMutation({
    mutationFn: (v: Values) => CareersApi.create(v),
    onSuccess: () => {
      toast.success('Created')
      qc.invalidateQueries({ queryKey: qk.careers.all() })
      navigate('/careers')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const update = useMutation({
    mutationFn: (v: Values) => CareersApi.update(id!, v),
    onSuccess: () => {
      toast.success('Updated')
      qc.invalidateQueries({ queryKey: qk.careers.all() })
      navigate('/careers')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  if (isEdit && isLoading) return null
  const submitting = create.isPending || update.isPending
  const errs = form.formState.errors

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit opening' : 'New opening'}</CardTitle>
        </CardHeader>

        <form
          onSubmit={form.handleSubmit((v) => (isEdit ? update.mutate(v) : create.mutate(v)))}
          className="flex flex-col gap-4"
        >
          <FormField label="Title" required error={errs.title?.message}>
            <Input {...form.register('title')} />
          </FormField>
          <FormField label="Description" required error={errs.description?.message}>
            <Textarea rows={4} {...form.register('description')} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Department" required error={errs.department?.message}>
              <Input {...form.register('department')} />
            </FormField>
            <FormField label="Location" required error={errs.location?.message}>
              <Input {...form.register('location')} />
            </FormField>
            <FormField label="Employment type" required>
              <Select {...form.register('employmentType')}>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Experience level" required>
              <Select {...form.register('experienceLevel')}>
                {EXPERIENCE_LEVELS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Experience years" required error={errs.experienceYears?.message}>
              <Input type="number" min={0} {...form.register('experienceYears', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Application deadline">
              <Input type="date" {...form.register('applicationDeadline')} />
            </FormField>
            <FormField label="Salary min (₹)">
              <Input type="number" min={0} {...form.register('salaryMin')} />
            </FormField>
            <FormField label="Salary max (₹)">
              <Input type="number" min={0} {...form.register('salaryMax')} />
            </FormField>
          </div>

          <FormField label="Skills" required error={errs.skills?.message}>
            <Controller
              name="skills"
              control={form.control}
              render={({ field }) => <TagInput value={field.value as string[]} onChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Qualifications" required error={errs.qualifications?.message}>
            <Controller
              name="qualifications"
              control={form.control}
              render={({ field }) => <TagInput value={field.value as string[]} onChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Responsibilities" required error={errs.responsibilities?.message}>
            <Controller
              name="responsibilities"
              control={form.control}
              render={({ field }) => <TagInput value={field.value as string[]} onChange={field.onChange} />}
            />
          </FormField>

          <Checkbox label="Active (accepting applications)" {...form.register('isActive')} />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/careers')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
