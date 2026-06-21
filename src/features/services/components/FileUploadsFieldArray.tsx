import { Control, Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/forms/FormField'
import { TagInput } from '@/components/forms/TagInput'

interface Props {
  name: string
  control: Control<any>
}

export function FileUploadsFieldArray({ name, control }: Props) {
  const { register } = useFormContext()
  const fa = useFieldArray({ control, name })

  return (
    <div className="flex flex-col gap-3">
      {fa.fields.map((field, idx) => (
        <div key={field.id} className="rounded-md border border-shell-border bg-shell-bg/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-shell-muted">Upload #{idx + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => fa.remove(idx)} aria-label="Remove">
              <Trash2 size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Field key" required>
              <Input {...register(`${name}.${idx}.fieldKey`)} placeholder="birthChart" />
            </FormField>
            <FormField label="Label" required>
              <Input {...register(`${name}.${idx}.label`)} placeholder="Upload birth chart" />
            </FormField>
            <FormField label="Tooltip">
              <Input {...register(`${name}.${idx}.tooltip`)} />
            </FormField>
            <FormField label="Order">
              <Input type="number" min={0} {...register(`${name}.${idx}.order`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Max files">
              <Input type="number" min={1} {...register(`${name}.${idx}.maxFiles`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Max size (MB)">
              <Input
                type="number"
                step="0.1"
                min={0.1}
                max={100}
                {...register(`${name}.${idx}.maxFileSizeMB`, { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField label="Accepted MIME types" required className="mt-3" hint="e.g. image/png, application/pdf">
            <Controller
              name={`${name}.${idx}.acceptedTypes`}
              control={control}
              render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} />}
            />
          </FormField>

          <div className="mt-3">
            <Checkbox label="Required" {...register(`${name}.${idx}.isRequired`)} />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          fa.append({
            fieldKey: '',
            label: '',
            acceptedTypes: ['image/jpeg', 'image/png'],
            maxFiles: 1,
            maxFileSizeMB: 5,
            isRequired: false,
            order: fa.fields.length,
          })
        }
      >
        <Plus size={14} /> Add upload
      </Button>
    </div>
  )
}
