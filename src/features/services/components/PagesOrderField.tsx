import { Control, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { MultiSelectDropdown } from '@/components/forms/MultiSelectDropdown'
import { PAGE_KEYS } from '@/lib/constants/pages'
import { ServicesApi } from '@/lib/api/services.api'
import { qk } from '@/lib/query/keys'

interface Props {
  control: Control<any>
  currentId?: string
}

export function PagesOrderField({ control, currentId }: Props) {
  const { data: allServices } = useQuery({
    queryKey: qk.services.all(),
    queryFn: () => ServicesApi.list(),
  })

  const nextOrderFor = (page: string) => {
    const orders = (allServices ?? [])
      .filter((s) => s._id !== currentId)
      .flatMap((s) => s.pages.filter((p) => p.page === page).map((p) => p.order))
    return orders.length ? Math.max(...orders) + 1 : 0
  }

  const occupantFor = (page: string, order: number) =>
    allServices?.find((s) => s._id !== currentId && s.pages.some((p) => p.page === page && p.order === order))

  return (
    <Controller
      name="pages"
      control={control}
      render={({ field }) => {
        const selectedPages: string[] = field.value.map((p: { page: string }) => p.page)

        const handleChange = (nextPages: string[]) => {
          const next = nextPages.map((page) => {
            const existing = field.value.find((p: { page: string }) => p.page === page)
            return existing ?? { page, order: nextOrderFor(page) }
          })
          field.onChange(next)
        }

        return (
          <div className="flex flex-col gap-3">
            <FormField label="Pages" required hint="Select every page this service should be listed on">
              <MultiSelectDropdown
                options={PAGE_KEYS.map((p) => ({ value: p, label: p }))}
                value={selectedPages}
                onChange={handleChange}
                placeholder="Select pages…"
              />
            </FormField>

            {field.value.length ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-shell-muted">
                  Listing order per page — defaults to last place; set a lower number to insert earlier and push later
                  services down
                </span>
                {field.value.map((row: { page: string; order: number }, idx: number) => {
                  const occupant = occupantFor(row.page, row.order)
                  return (
                    <div key={row.page} className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 rounded-md border border-shell-border bg-shell-bg/40 p-2">
                        <span className="flex-1 text-sm text-shell-text">{row.page}</span>
                        <Input
                          type="number"
                          min={0}
                          className="w-24"
                          value={row.order}
                          onChange={(e) => {
                            const next = [...field.value]
                            next[idx] = { ...next[idx], order: Number(e.target.value) }
                            field.onChange(next)
                          }}
                        />
                      </div>
                      {occupant ? (
                        <span className="text-xs text-shell-muted">
                          Currently "{occupant.title}" — saving will move it (and everything after it) down one slot.
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      }}
    />
  )
}
