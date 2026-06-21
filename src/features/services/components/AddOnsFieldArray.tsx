import { Control, useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/forms/FormField'
import { FormInputsFieldArray } from './FormInputsFieldArray'
import { FileUploadsFieldArray } from './FileUploadsFieldArray'

interface Props {
  control: Control<any>
}

export function AddOnsFieldArray({ control }: Props) {
  const { register } = useFormContext()
  const fa = useFieldArray({ control, name: 'addOns' })

  return (
    <div className="flex flex-col gap-3">
      {fa.fields.map((field, idx) => (
        <div key={field.id} className="rounded-lg border border-shell-border-strong p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-shell-heading">Add-on #{idx + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => fa.remove(idx)} aria-label="Remove">
              <Trash2 size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Key" required>
              <Input {...register(`addOns.${idx}.key`)} placeholder="rush-delivery" />
            </FormField>
            <FormField label="Label" required>
              <Input {...register(`addOns.${idx}.label`)} placeholder="Rush delivery" />
            </FormField>
            <FormField label="Price (₹)" required>
              <Input type="number" min={0} {...register(`addOns.${idx}.price`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Description" className="col-span-2">
              <Textarea rows={2} {...register(`addOns.${idx}.description`)} />
            </FormField>
          </div>

          <div className="mt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase text-shell-muted">Add-on form inputs</h4>
            <FormInputsFieldArray name={`addOns.${idx}.formInputs`} control={control} />
          </div>

          <div className="mt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase text-shell-muted">Add-on file uploads</h4>
            <FileUploadsFieldArray name={`addOns.${idx}.fileUploads`} control={control} />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          fa.append({
            key: '',
            label: '',
            description: '',
            price: 0,
            formInputs: [],
            fileUploads: [],
          })
        }
      >
        <Plus size={14} /> Add add-on
      </Button>
    </div>
  )
}
