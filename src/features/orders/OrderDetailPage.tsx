import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Download, Mail, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { OrdersApi } from '@/lib/api/orders.api'
import { UsersApi } from '@/lib/api/users.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { FormField } from '@/components/forms/FormField'
import { formatBytes, formatDateTime, formatINR } from '@/lib/utils/format'
import { downloadOrderFile } from '@/lib/utils/download'
import { toApiError } from '@/lib/api/errors'
import { ORDER_STATUSES, type OrderStatus } from '@/types/order'
import { allowedNextStatuses } from '@/lib/constants/orderTransitions'
import { Video, ExternalLink } from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: qk.orders.detail(id!),
    queryFn: () => OrdersApi.get(id!),
    enabled: !!id,
  })

  const { data: employeesData } = useQuery({
    queryKey: qk.users.list({ role: 'employee' }),
    queryFn: () => UsersApi.list({ role: 'employee', limit: 200 }),
    enabled: user?.role === 'admin',
  })

  const assignOrder = useMutation({
    mutationFn: (userId: string | null) => OrdersApi.assign(id!, userId),
    onSuccess: () => {
      toast.success('Assignment updated')
      qc.invalidateQueries({ queryKey: qk.orders.detail(id!) })
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateStatus = useMutation({
    mutationFn: () => OrdersApi.updateStatus(id!, status as OrderStatus, note || undefined),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: qk.orders.all() })
      setNote('')
      setStatus('')
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const uploadOutputFile = useMutation({
    mutationFn: (file: File) => OrdersApi.uploadOutputFile(id!, file),
    onSuccess: () => {
      toast.success('Output file uploaded')
      qc.invalidateQueries({ queryKey: qk.orders.detail(id!) })
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    onError: (e) => toast.error(toApiError(e).message),
  })

  const sendCompletionEmail = useMutation({
    mutationFn: () => OrdersApi.sendCompletionEmail(id!),
    onSuccess: () => {
      toast.success('Completion email sent to customer')
      qc.invalidateQueries({ queryKey: qk.orders.detail(id!) })
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

  const customer = typeof data.customerId === 'object' ? data.customerId : null
  const service = typeof data.serviceId === 'object' ? data.serviceId : null
  const requiresOutputFile = service?.requiresOutputFile ?? false
  const assignee = typeof data.assignedTo === 'object' ? data.assignedTo : null
  const employees = employeesData?.items ?? []

  async function onDownload(fieldKey: string, addOnKey: string | undefined, name: string) {
    try {
      await downloadOrderFile(id!, fieldKey, addOnKey, name)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Link to="/orders" className="text-sm text-shell-muted hover:text-shell-text">
        ← Orders
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            <code>{data.orderNumber}</code>
          </CardTitle>
          <div className="flex gap-2">
            <Badge tone="info">{data.orderStatus}</Badge>
            <Badge tone={data.paymentStatus === 'paid' ? 'success' : 'warning'}>{data.paymentStatus}</Badge>
          </div>
        </CardHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-shell-muted">Service</dt>
          <dd>
            {data.serviceSnapshot.title} <code className="ml-1 text-xs text-shell-muted">{data.serviceSku}</code>
          </dd>
          <dt className="text-shell-muted">Customer</dt>
          <dd>{customer ? `${customer.name} · ${customer.email} · ${customer.phone}` : '—'}</dd>
          <dt className="text-shell-muted">Assigned to</dt>
          <dd>
            {user?.role === 'admin' ? (
              <Select
                value={assignee?._id ?? ''}
                onChange={(e) => assignOrder.mutate(e.target.value || null)}
                disabled={assignOrder.isPending}
              >
                <option value="">Unassigned</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.email})
                  </option>
                ))}
              </Select>
            ) : (
              assignee?.name ?? '—'
            )}
          </dd>
          <dt className="text-shell-muted">Quantity</dt>
          <dd>{data.quantity}</dd>
          <dt className="text-shell-muted">Total</dt>
          <dd>{formatINR(data.pricing.finalAmount)}</dd>
          {data.pricing.couponCode && (
            <>
              <dt className="text-shell-muted">Coupon</dt>
              <dd><code className="rounded bg-shell-bg px-1.5 py-0.5 text-xs">{data.pricing.couponCode}</code></dd>
            </>
          )}
          <dt className="text-shell-muted">Razorpay order</dt>
          <dd className="font-mono text-xs">{data.razorpayOrderId ?? '—'}</dd>
          <dt className="text-shell-muted">Razorpay payment</dt>
          <dd className="font-mono text-xs">{data.razorpayPaymentId ?? '—'}</dd>
          <dt className="text-shell-muted">Created</dt>
          <dd>{formatDateTime(data.createdAt)}</dd>
          {data.deadline && (
            <>
              <dt className="text-shell-muted">Deadline</dt>
              <dd className={new Date(data.deadline) < new Date() && !['completed','awaiting_feedback','closed','cancelled'].includes(data.orderStatus) ? 'font-semibold text-red-500' : ''}>
                {formatDateTime(data.deadline)}
              </dd>
            </>
          )}
          <dt className="text-shell-muted">Files purged</dt>
          <dd>{data.filesPurgedAt ? formatDateTime(data.filesPurgedAt) : 'No'}</dd>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing breakdown</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-shell-muted">Base</dt>
          <dd>{formatINR(data.pricing.basePrice)}</dd>
          <dt className="text-shell-muted">Add-ons</dt>
          <dd>{formatINR(data.pricing.addOnsTotal)}</dd>
          <dt className="text-shell-muted">Subtotal</dt>
          <dd>{formatINR(data.pricing.subtotal)}</dd>
          <dt className="text-shell-muted">Discount ({data.pricing.discountPercentage}%)</dt>
          <dd>-{formatINR(data.pricing.discountAmount)}</dd>
          {data.pricing.couponCode && (
            <>
              <dt className="text-shell-muted">
                Coupon <code className="ml-1 rounded bg-shell-bg px-1 py-0.5 text-xs">{data.pricing.couponCode}</code>
              </dt>
              <dd className="text-success">-{formatINR(data.pricing.couponDiscount)}</dd>
            </>
          )}
          <dt className="font-semibold">Final</dt>
          <dd className="font-semibold">{formatINR(data.pricing.finalAmount)}</dd>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form responses</CardTitle>
        </CardHeader>
        {data.formResponses.length === 0 ? (
          <p className="text-sm text-shell-muted">No responses.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {data.formResponses.map((r, i) => (
              <li key={`${r.fieldKey}-${i}`} className="rounded bg-shell-bg px-2 py-1">
                <div className="text-xs text-shell-muted">
                  {r.addOnKey ? <span>[{r.addOnKey}] </span> : null}
                  <code>{r.fieldKey}</code> · {r.label}
                </div>
                <div className="break-words">{String(r.value ?? '—')}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded files ({data.fileUploads.length})</CardTitle>
        </CardHeader>
        {data.filesPurgedAt ? (
          <p className="text-sm text-warning">Files were purged on {formatDateTime(data.filesPurgedAt)}.</p>
        ) : data.fileUploads.length === 0 ? (
          <p className="text-sm text-shell-muted">No files uploaded.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {data.fileUploads.map((f, i) => (
              <li
                key={`${f.fieldKey}-${i}`}
                className="flex items-center justify-between rounded border border-shell-border px-2 py-2"
              >
                <div>
                  <div className="font-medium">{f.originalName}</div>
                  <div className="text-xs text-shell-muted">
                    <code>{f.fieldKey}</code>
                    {f.addOnKey ? ` · add-on ${f.addOnKey}` : ''} · {f.mimeType} · {formatBytes(f.storedSizeBytes)} ·{' '}
                    {f.compression}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => onDownload(f.fieldKey, f.addOnKey, f.originalName)}>
                  <Download size={14} /> Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {requiresOutputFile && (
        <Card>
          <CardHeader>
            <CardTitle>Output files</CardTitle>
          </CardHeader>

          {data.outputFiles && data.outputFiles.length > 0 && (
            <ul className="mb-4 flex flex-col gap-2 text-sm">
              {data.outputFiles.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded border border-shell-border px-2 py-2">
                  <div>
                    <div className="font-medium">{f.originalName}</div>
                    <div className="text-xs text-shell-muted">Uploaded {formatDateTime(f.uploadedAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadOutputFile.mutate(file)
                }}
              />
              <Button
                type="button"
                variant="secondary"
                loading={uploadOutputFile.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload PDF
              </Button>
            </label>

            <Button
              type="button"
              onClick={() => sendCompletionEmail.mutate()}
              loading={sendCompletionEmail.isPending}
              disabled={!data.outputFiles || data.outputFiles.length === 0}
            >
              <Mail size={14} /> Send completion email
            </Button>
          </div>

          {data.feedbackEmailSentAt && (
            <p className="mt-3 text-xs text-shell-muted">
              Feedback email sent {formatDateTime(data.feedbackEmailSentAt)}
            </p>
          )}
        </Card>
      )}

      {data.consultation && (
        <Card>
          <CardHeader>
            <CardTitle>Consultation</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2 text-sm">
            <div>
              <span className="text-shell-muted">Scheduled: </span>
              {formatDateTime(data.consultation.scheduledAt)} – {formatDateTime(data.consultation.endTime)}
            </div>
            {data.consultation.meetLink && (
              <a
                href={data.consultation.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1 rounded bg-brand-purple px-3 py-1.5 text-white"
              >
                <Video size={14} /> Join Google Meet <ExternalLink size={12} />
              </a>
            )}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update status</CardTitle>
        </CardHeader>
        {data.paymentStatus !== 'paid' && (
          <p className="mb-2 text-xs text-amber-600">
            Payment is not completed — work-related statuses are disabled until payment is received.
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="New status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
              <option value="">Select…</option>
              {(() => {
                const allowed = allowedNextStatuses(data.orderStatus, data.paymentStatus)
                return ORDER_STATUSES.filter((s) => s !== data.orderStatus).map((s) => (
                  <option key={s} value={s} disabled={!allowed.includes(s)}>
                    {s}
                    {!allowed.includes(s) ? ' (not allowed)' : ''}
                  </option>
                ))
              })()}
            </Select>
          </FormField>
          <FormField label="Note (optional)" className="col-span-2">
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
        </div>
        <div className="mt-3">
          <Button onClick={() => updateStatus.mutate()} disabled={!status} loading={updateStatus.isPending}>
            Update
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit timeline</CardTitle>
        </CardHeader>
        {data.timeline?.length ? (
          <ol className="flex flex-col gap-3 text-sm">
            {[...data.timeline].reverse().map((t, i) => (
              <li key={i} className="border-l-2 border-brand-purple/30 pl-3">
                <div className="text-xs text-shell-muted">{formatDateTime(t.at)}</div>
                <div className="flex items-center gap-2">
                  <Badge tone={timelineTone(t.type)}>{t.type.replace(/_/g, ' ')}</Badge>
                  <span>{t.message}</span>
                </div>
                {t.type === 'consultation_scheduled' && (t.meta?.meetLink as string) ? (
                  <a href={t.meta!.meetLink as string} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-purple underline">
                    Meet link
                  </a>
                ) : null}
              </li>
            ))}
          </ol>
        ) : data.statusHistory?.length ? (
          <ol className="flex flex-col gap-2 text-sm">
            {data.statusHistory.map((h, i) => (
              <li key={i} className="rounded bg-shell-bg px-2 py-1">
                <div className="text-xs text-shell-muted">{formatDateTime(h.at)}</div>
                <div>
                  <Badge tone="neutral">{h.from}</Badge> → <Badge tone="info">{h.to}</Badge>
                  {h.note ? <span className="ml-2 text-shell-muted">— {h.note}</span> : null}
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

function timelineTone(type: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand' {
  switch (type) {
    case 'payment_completed':
      return 'success'
    case 'payment_failed':
      return 'danger'
    case 'consultation_scheduled':
      return 'brand'
    case 'email_sent':
    case 'feedback_requested':
    case 'output_files_sent':
      return 'info'
    case 'status_changed':
      return 'warning'
    default:
      return 'neutral'
  }
}
