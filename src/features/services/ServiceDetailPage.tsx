import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { ServicesApi } from '@/lib/api/services.api'
import { qk } from '@/lib/query/keys'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime, formatINR } from '@/lib/utils/format'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: qk.services.detail(id!),
    queryFn: () => ServicesApi.get(id!),
    enabled: !!id,
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
      <div className="flex items-center justify-between">
        <Link to="/services" className="text-sm text-shell-muted hover:text-shell-text">
          ← Services
        </Link>
        {can(user?.role, 'services', 'write') ? (
          <Button onClick={() => navigate(`/services/${id}/edit`)}>
            <Pencil size={14} /> Edit
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
          <Badge tone="brand">{data.type}</Badge>
        </CardHeader>
        <p className="text-sm text-shell-muted">{data.subtitle}</p>
        <p className="mt-3 text-sm">{data.description}</p>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-shell-muted">SKU</dt>
          <dd>
            <code>{data.sku}</code>
          </dd>
          <dt className="text-shell-muted">Price</dt>
          <dd>{formatINR(data.price)}</dd>
          <dt className="text-shell-muted">Discount</dt>
          <dd>{data.discountPercentage}%</dd>
          <dt className="text-shell-muted">Active</dt>
          <dd>{data.isActiveService ? 'Yes' : 'No'}</dd>
          <dt className="text-shell-muted">Sold</dt>
          <dd>{data.soldCount}</dd>
          <dt className="text-shell-muted">Pages</dt>
          <dd className="flex flex-wrap gap-1">
            {data.pages.map((p) => (
              <Badge key={p.page} tone="neutral">
                {p.page} (#{p.order})
              </Badge>
            ))}
          </dd>
          <dt className="text-shell-muted">Created</dt>
          <dd>{formatDateTime(data.createdAt)}</dd>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form inputs ({data.formInputs.length})</CardTitle>
        </CardHeader>
        <ul className="flex flex-col gap-1 text-sm">
          {data.formInputs.map((f) => (
            <li key={f.fieldKey} className="flex items-center justify-between rounded bg-shell-bg px-2 py-1">
              <span>
                <code className="text-xs">{f.fieldKey}</code> · {f.label}
              </span>
              <Badge tone="neutral">{f.type}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File uploads ({data.fileUploads.length})</CardTitle>
        </CardHeader>
        <ul className="flex flex-col gap-1 text-sm">
          {data.fileUploads.map((f) => (
            <li key={f.fieldKey} className="rounded bg-shell-bg px-2 py-1">
              <code className="text-xs">{f.fieldKey}</code> · {f.label} · max {f.maxFiles} files,{' '}
              {f.maxFileSizeMB} MB
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add-ons ({data.addOns.length})</CardTitle>
        </CardHeader>
        <ul className="flex flex-col gap-2 text-sm">
          {data.addOns.map((a) => (
            <li key={a.key} className="rounded border border-shell-border p-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{a.label}</span>
                <span>{formatINR(a.price)}</span>
              </div>
              {a.description ? <p className="mt-1 text-xs text-shell-muted">{a.description}</p> : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
