import { useEffect } from 'react'
import { Control, Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/forms/FormField'
import { TagInput } from '@/components/forms/TagInput'
import { FIELD_TYPES, type FieldType } from '@/types/service'

interface Props {
  name: string
  control: Control<any>
}

export function FormInputsFieldArray({ name, control }: Props) {
  const { register, formState } = useFormContext()
  const fa = useFieldArray({ control, name })

  return (
    <div className="flex flex-col gap-3">
      {fa.fields.map((field, idx) => (
        <FieldRow
          key={field.id}
          baseName={`${name}.${idx}`}
          onRemove={() => fa.remove(idx)}
          register={register}
          errors={formState.errors}
          index={idx}
          control={control}
        />
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          fa.append({
            fieldKey: '',
            label: '',
            type: 'text',
            isRequired: false,
            order: fa.fields.length,
            validation: { maxLength: 100 },
          })
        }
      >
        <Plus size={14} /> Add input
      </Button>
    </div>
  )
}

interface RowProps {
  baseName: string
  index: number
  onRemove: () => void
  register: ReturnType<typeof useFormContext>['register']
  errors: Record<string, unknown>
  control: Control<any>
}

function FieldRow({ baseName, index, onRemove, register, control }: RowProps) {
  const { setValue, getValues } = useFormContext()
  const type = useWatch({ control, name: `${baseName}.type` }) as FieldType | undefined

  useEffect(() => {
    if (type === 'text' && !getValues(`${baseName}.validation.maxLength`)) {
      setValue(`${baseName}.validation.maxLength`, 100)
    }
  }, [type, baseName, getValues, setValue])

  const showOptions = type === 'dropdown' || type === 'multiSelect' || type === 'radio'
  const showNumber = type === 'number'
  const showDate = type === 'date'
  const showPattern = type === 'text' || type === 'email' || type === 'phonenumber'
  const showLength = type === 'text' || type === 'textarea' || type === 'password'

  return (
    <div className="rounded-md border border-shell-border bg-shell-bg/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-shell-muted">Input #{index + 1}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label="Remove">
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Field key" required>
          <Input {...register(`${baseName}.fieldKey`)} placeholder="dateOfBirth" />
        </FormField>
        <FormField label="Label" required>
          <Input {...register(`${baseName}.label`)} placeholder="Date of birth" />
        </FormField>
        <FormField label="Type" required>
          <Select {...register(`${baseName}.type`)}>
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Order">
          <Input type="number" min={0} {...register(`${baseName}.order`, { valueAsNumber: true })} />
        </FormField>
        <FormField label="Placeholder">
          <Input {...register(`${baseName}.placeholder`)} />
        </FormField>
        <FormField label="Tooltip">
          <Input {...register(`${baseName}.tooltip`)} />
        </FormField>
      </div>

      <div className="mt-2">
        <Checkbox label="Required" {...register(`${baseName}.isRequired`)} />
      </div>

      {showOptions ? (
        <FormField label="Options" className="mt-3" hint="Press Enter to add">
          <Controller
            name={`${baseName}.options`}
            control={control}
            render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} />}
          />
        </FormField>
      ) : null}

      {(showNumber || showDate || showPattern || showLength) ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded border border-shell-border p-2">
          <span className="col-span-2 text-xs font-semibold text-shell-muted">Validation</span>
          {showLength ? (
            <>
              <FormField label="Min length">
                <Input type="number" min={0} {...register(`${baseName}.validation.minLength`)} />
              </FormField>
              <FormField label="Max length">
                <Input type="number" min={1} {...register(`${baseName}.validation.maxLength`)} />
              </FormField>
            </>
          ) : null}
          {showNumber ? (
            <>
              <FormField label="Min">
                <Input type="number" {...register(`${baseName}.validation.min`)} />
              </FormField>
              <FormField label="Max">
                <Input type="number" {...register(`${baseName}.validation.max`)} />
              </FormField>
            </>
          ) : null}
          {showDate ? (
            <>
              <FormField label="Min date">
                <Input type="date" {...register(`${baseName}.validation.minDate`)} />
              </FormField>
              <FormField label="Max date">
                <Input type="date" {...register(`${baseName}.validation.maxDate`)} />
              </FormField>
            </>
          ) : null}
          {showPattern ? (
            <FormField label="Regex pattern" className="col-span-2">
              <Input {...register(`${baseName}.validation.pattern`)} />
            </FormField>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
