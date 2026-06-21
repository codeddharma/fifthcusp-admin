import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CustomersApi } from '@/lib/api/customers.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { FormField } from '@/components/forms/FormField'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import { toApiError } from '@/lib/api/errors'

function toDateInput(iso?: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: qk.customers.detail(id!),
    queryFn: () => CustomersApi.get(id!),
    enabled: !!id,
  })

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [anniversaryDate, setAnniversaryDate] = useState('')

  useEffect(() => {
    if (data) {
      setName(data.name)
      setPhone(data.phone)
      setNotes(data.notes ?? '')
      setBirthDate(toDateInput(data.birthDate))
      setAnniversaryDate(toDateInput(data.anniversaryDate))
    }
  }, [data])

  const update = useMutation({
    mutationFn: () =>
      CustomersApi.update(id!, {
        name,
        phone,
        notes,
        birthDate: birthDate || undefined,
        anniversaryDate: anniversaryDate || undefined,
      }),
    onSuccess: () => {
      toast.success('Customer updated')
      qc.invalidateQueries({ queryKey: qk.customers.all() })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link to="/customers" className="text-sm text-shell-muted hover:text-shell-text">
        ← Customers
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-shell-muted">Customer ID</dt>
          <dd className="font-mono">{data.customerId}</dd>
          <dt className="text-shell-muted">Email</dt>
          <dd>{data.email}</dd>
          <dt className="text-shell-muted">Joined</dt>
          <dd>{formatDateTime(data.createdAt)}</dd>
          <dt className="text-shell-muted">Orders</dt>
          <dd>{data.orders?.length ?? 0}</dd>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3">
          <FormField label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <FormField label="Birth date">
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </FormField>
          <FormField label="Anniversary date">
            <Input type="date" value={anniversaryDate} onChange={(e) => setAnniversaryDate(e.target.value)} />
          </FormField>
          <FormField label="Internal notes" hint="Visible to admins only">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
          <div>
            <Button onClick={() => update.mutate()} loading={update.isPending}>
              Save changes
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order history</CardTitle>
        </CardHeader>
        {data.orders?.length ? (
          <ul className="flex flex-col gap-1 text-sm">
            {data.orders.map((order) => (
              <li key={order._id} className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-shell-bg">
                <Link to={`/orders/${order._id}`} className="font-mono text-xs text-brand-deep underline">
                  {order.orderNumber}
                </Link>
                <span className="text-shell-muted">{order.orderStatus}</span>
                <span className={order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>
                  {order.paymentStatus}
                </span>
                <span className="ml-auto text-xs text-shell-muted">{formatDate(order.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-shell-muted">No orders yet.</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        {data.activityLog?.length ? (
          <ol className="flex flex-col gap-3 text-sm">
            {[...data.activityLog].reverse().map((a, i) => (
              <li key={i} className="border-l-2 border-brand-purple/30 pl-3">
                <div className="text-xs text-shell-muted">{formatDateTime(a.at)}</div>
                <div>
                  <span className="mr-2 rounded-full bg-shell-bg px-2 py-0.5 text-xs">{a.type.replace(/_/g, ' ')}</span>
                  {a.message}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-shell-muted">No activity yet.</p>
        )}
      </Card>
    </div>
  )
}
