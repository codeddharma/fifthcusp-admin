import { useMemo } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Video, Bell, CalendarDays } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { format, parseISO, startOfDay, subDays } from 'date-fns'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { KpiCard } from './KpiCard'
import { OrdersApi } from '@/lib/api/orders.api'
import { CustomersApi } from '@/lib/api/customers.api'
import { ServicesApi } from '@/lib/api/services.api'
import { TestimonialsApi } from '@/lib/api/testimonials.api'
import { CareersApi } from '@/lib/api/careers.api'
import { BlogsApi } from '@/lib/api/blogs.api'
import { ContentApi } from '@/lib/api/content.api'
import { ConsultationEventsApi } from '@/lib/api/consultationEvents.api'
import { RemedyEventsApi } from '@/lib/api/remedyEvents.api'
import { CouponsApi } from '@/lib/api/coupons.api'
import { PaymentLinksApi } from '@/lib/api/paymentLinks.api'
import { qk } from '@/lib/query/keys'
import { useAuth } from '@/lib/auth/useAuth'
import { can } from '@/lib/auth/permissions'
import { formatDateTime, formatINR } from '@/lib/utils/format'
import type { Order, OrderStatus } from '@/types/order'

export function DashboardPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const canOrders = can(user?.role, 'orders', 'read')
  const canCustomers = can(user?.role, 'customers', 'read')
  const canContent = can(user?.role, 'content', 'read')
  const canConsultations = can(user?.role, 'consultationEvents', 'read')
  const canRemedies = can(user?.role, 'remedyEvents', 'read')
  const canCoupons = can(user?.role, 'coupons', 'read')
  const canPaymentLinks = can(user?.role, 'paymentLinks', 'read')

  const fromIso = useMemo(() => startOfDay(subDays(new Date(), 30)).toISOString(), [])
  const todayIso = useMemo(() => startOfDay(new Date()).toISOString(), [])

  const queries = useQueries({
    queries: [
      {
        queryKey: qk.orders.list({ kpi: 'total', limit: 1 }),
        queryFn: () => OrdersApi.list({ limit: 1 }),
        enabled: canOrders,
      },
      {
        queryKey: qk.orders.list({ kpi: 'pending', limit: 1 }),
        queryFn: () => OrdersApi.list({ paymentStatus: 'pending', limit: 1 }),
        enabled: canOrders,
      },
      {
        queryKey: qk.orders.list({ kpi: 'in_progress', limit: 1 }),
        queryFn: () => OrdersApi.list({ orderStatus: 'in_progress', limit: 1 }),
        enabled: canOrders,
      },
      {
        queryKey: qk.orders.list({ kpi: 'completed', from: fromIso, limit: 1 }),
        queryFn: () => OrdersApi.list({ orderStatus: 'completed', from: fromIso, limit: 1 }),
        enabled: canOrders,
      },
      {
        queryKey: qk.customers.list({ kpi: 'total', limit: 1 }),
        queryFn: () => CustomersApi.list({ limit: 1 }),
        enabled: canCustomers,
      },
      {
        queryKey: qk.services.list({ onlyActive: true }),
        queryFn: () => ServicesApi.list({ onlyActive: true }),
      },
      {
        queryKey: qk.testimonials.list({ kpi: 'pending' }),
        queryFn: () => TestimonialsApi.list({ isApproved: false, isRejected: false, limit: 1 }),
      },
      {
        queryKey: qk.careers.list({ kpi: 'open' }),
        queryFn: () => CareersApi.list({ isActive: true, isClosed: false, limit: 1 }),
      },
      {
        queryKey: qk.blogs.list({ kpi: 'drafts' }),
        queryFn: () => BlogsApi.list({ isPublished: false, limit: 1 }),
      },
      {
        queryKey: qk.content.list(),
        queryFn: () => ContentApi.list(),
        enabled: canContent,
      },
    ],
  })

  const [totalOrdersQ, pendingPayQ, inProgressQ, completed30Q, customersQ, activeServicesQ, pendingTestQ, openCareersQ, draftBlogsQ, pagesQ] = queries

  const recentOrdersQ = useQuery({
    queryKey: qk.orders.list({ kpi: 'recent30', limit: 200, from: fromIso }),
    queryFn: () => OrdersApi.list({ limit: 200, from: fromIso }),
    enabled: canOrders,
  })

  const deadlinesQ = useQuery({
    queryKey: ['orders', 'deadlines'],
    queryFn: () => OrdersApi.getDeadlines(),
    enabled: canOrders,
    refetchInterval: 5 * 60 * 1000,
  })

  const consultationsQ = useQuery({
    queryKey: qk.consultationEvents.list({ kpi: 'dashboard', from: todayIso }),
    queryFn: () => ConsultationEventsApi.list({ from: todayIso, limit: 100 }),
    enabled: canConsultations,
  })

  const remediesQ = useQuery({
    queryKey: qk.remedyEvents.list({ kpi: 'dashboard', from: todayIso }),
    queryFn: () => RemedyEventsApi.list({ from: todayIso, limit: 100 }),
    enabled: canRemedies,
  })

  const couponsQ = useQuery({
    queryKey: qk.coupons.list({ kpi: 'dashboard' }),
    queryFn: () => CouponsApi.list({ limit: 100 }),
    enabled: canCoupons,
  })

  const paymentLinksQ = useQuery({
    queryKey: qk.paymentLinks.list({ kpi: 'dashboard' }),
    queryFn: () => PaymentLinksApi.list({ limit: 200 }),
    enabled: canPaymentLinks,
  })

  const bulkFeedbackEmail = useMutation({
    mutationFn: () => OrdersApi.bulkFeedbackEmail(),
    onSuccess: (data) => {
      toast.success(`Feedback emails triggered: ${data.sent} sent, ${data.skipped} skipped.`)
      qc.invalidateQueries({ queryKey: qk.orders.all() })
    },
    onError: () => toast.error('Failed to trigger feedback emails.'),
  })

  const chartData = useMemo(() => buildChartData(recentOrdersQ.data?.items ?? []), [recentOrdersQ.data])

  const consultations = consultationsQ.data?.items ?? []
  const remedies = remediesQ.data?.items ?? []
  const coupons = couponsQ.data?.items ?? []
  const paymentLinks = paymentLinksQ.data?.items ?? []

  const now = Date.now()
  const in7days = now + 7 * 24 * 60 * 60 * 1000
  const upcomingConsultations = consultations
    .filter((c) => new Date(c.startTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const pendingRemedies = remedies
    .filter((r) => !r.reminderSentAt && new Date(r.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  const activeCoupons = coupons.filter((c) => c.isActive)

  const consultationCalEvents = consultations.map((c) => ({
    id: c._id,
    title: typeof c.customerId === 'object' ? c.customerId.name : c.title,
    start: c.startTime,
    end: c.endTime,
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  }))
  const remedyCalEvents = remedies.map((r) => ({
    id: r._id,
    title: r.remedyName,
    start: r.scheduledAt,
    backgroundColor: r.reminderSentAt ? '#16a34a' : '#d97706',
    borderColor: r.reminderSentAt ? '#16a34a' : '#d97706',
  }))

  const couponChart = [...coupons]
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 6)
    .map((c) => ({ code: c.code, used: c.usedCount }))

  const PL_COLORS: Record<string, string> = { paid: '#16a34a', pending: '#d97706', cancelled: '#6b7280', expired: '#dc2626' }
  const paymentLinkChart = (['paid', 'pending', 'cancelled', 'expired'] as const)
    .map((status) => ({ status, count: paymentLinks.filter((p) => p.status === status).length }))
    .filter((d) => d.count > 0)

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-shell-heading">Welcome back, {user?.name?.split(' ')[0] ?? 'admin'}.</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {canOrders ? (
          <>
            <KpiCard
              label="Total orders"
              value={totalOrdersQ.data?.pagination.total ?? 0}
              loading={totalOrdersQ.isLoading}
              to="/orders"
            />
            <KpiCard
              label="Pending payment"
              tone="warning"
              value={pendingPayQ.data?.pagination.total ?? 0}
              loading={pendingPayQ.isLoading}
              to="/orders"
            />
            <KpiCard
              label="In progress"
              value={inProgressQ.data?.pagination.total ?? 0}
              loading={inProgressQ.isLoading}
              to="/orders"
            />
            <KpiCard
              label="Completed (30d)"
              tone="success"
              value={completed30Q.data?.pagination.total ?? 0}
              loading={completed30Q.isLoading}
              to="/orders"
            />
          </>
        ) : null}

        {canCustomers ? (
          <KpiCard
            label="Customers"
            value={customersQ.data?.pagination.total ?? 0}
            loading={customersQ.isLoading}
            to="/customers"
          />
        ) : null}

        <KpiCard
          label="Active services"
          value={activeServicesQ.data?.length ?? 0}
          loading={activeServicesQ.isLoading}
          to="/services"
        />
        <KpiCard
          label="Pending testimonials"
          tone="warning"
          value={pendingTestQ.data?.pagination.total ?? 0}
          loading={pendingTestQ.isLoading}
          to="/testimonials"
        />
        <KpiCard
          label="Open positions"
          value={openCareersQ.data?.pagination.total ?? 0}
          loading={openCareersQ.isLoading}
          to="/careers"
        />
        <KpiCard
          label="Draft blogs"
          value={draftBlogsQ.data?.pagination.total ?? 0}
          loading={draftBlogsQ.isLoading}
          to="/blogs"
        />
        {canContent ? (
          <KpiCard
            label="Pages"
            value={pagesQ.data?.length ?? 0}
            loading={pagesQ.isLoading}
            to="/content"
          />
        ) : null}
        {canConsultations ? (
          <KpiCard
            label="Upcoming consultations"
            value={upcomingConsultations.length}
            loading={consultationsQ.isLoading}
            to="/consultation-events"
          />
        ) : null}
        {canRemedies ? (
          <KpiCard
            label="Pending remedies"
            tone="warning"
            value={pendingRemedies.length}
            loading={remediesQ.isLoading}
            to="/remedy-events"
          />
        ) : null}
        {canCoupons ? (
          <KpiCard
            label="Active coupons"
            value={activeCoupons.length}
            loading={couponsQ.isLoading}
            to="/coupons"
          />
        ) : null}
      </div>

      {canOrders ? (
        <Card>
          <CardHeader>
            <CardTitle>Delivery deadlines at risk</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              loading={bulkFeedbackEmail.isPending}
              onClick={() => bulkFeedbackEmail.mutate()}
            >
              <Mail size={14} /> Send feedback emails to completed orders
            </Button>
          </CardHeader>
          {deadlinesQ.isLoading ? (
            <p className="text-sm text-shell-muted">Loading…</p>
          ) : (deadlinesQ.data?.overdue.length ?? 0) === 0 && (deadlinesQ.data?.dueSoon.length ?? 0) === 0 ? (
            <p className="text-sm text-shell-muted">No orders are overdue or due within the next 2 days.</p>
          ) : (
            <>
              {deadlinesQ.data?.overdue.length ? (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">Overdue</p>
                  <ul className="flex flex-col gap-1.5">
                    {deadlinesQ.data.overdue.map((o) => {
                      const customer = typeof o.customerId === 'object' ? o.customerId : null
                      return (
                        <li key={o._id} className="flex items-center justify-between rounded bg-red-50 px-3 py-2 text-sm dark:bg-red-950/30">
                          <div>
                            <Link to={`/orders/${o._id}`} className="font-mono font-medium text-red-600 hover:underline dark:text-red-400">
                              {o.orderNumber}
                            </Link>
                            <span className="ml-2 text-shell-muted">{o.serviceSnapshot.title}</span>
                            {customer && <span className="ml-2 text-shell-muted">· {customer.name}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-500">{o.deadline ? formatDateTime(o.deadline) : '—'}</span>
                            <Badge tone="danger">{o.orderStatus}</Badge>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
              {deadlinesQ.data?.dueSoon.length ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-500">Due within 2 days</p>
                  <ul className="flex flex-col gap-1.5">
                    {deadlinesQ.data.dueSoon.map((o) => {
                      const customer = typeof o.customerId === 'object' ? o.customerId : null
                      return (
                        <li key={o._id} className="flex items-center justify-between rounded bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/30">
                          <div>
                            <Link to={`/orders/${o._id}`} className="font-mono font-medium text-amber-700 hover:underline dark:text-amber-400">
                              {o.orderNumber}
                            </Link>
                            <span className="ml-2 text-shell-muted">{o.serviceSnapshot.title}</span>
                            {customer && <span className="ml-2 text-shell-muted">· {customer.name}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-amber-600">{o.deadline ? formatDateTime(o.deadline) : '—'}</span>
                            <Badge tone="warning">{o.orderStatus}</Badge>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </Card>
      ) : null}

      {canOrders ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Orders by status (last 30d)</CardTitle>
            </CardHeader>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e6ee" />
                  <XAxis dataKey="status" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders per day (last 30d)</CardTitle>
            </CardHeader>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e6ee" />
                  <XAxis dataKey="day" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#7b2cbf" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue (paid orders, last 30d)</CardTitle>
            </CardHeader>
            <div className="text-2xl font-semibold text-shell-heading">{formatINR(chartData.paidRevenue)}</div>
            <p className="text-xs text-shell-muted">Sum of paid orders' final amount in the last 30 days.</p>
          </Card>
        </div>
      ) : null}

      {/* Reminders: upcoming consultations + pending remedies */}
      {(canConsultations || canRemedies) ? (
        <Card>
          <CardHeader>
            <CardTitle>Reminders & upcoming sessions</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {canConsultations ? (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
                  <Video size={13} /> Consultations (next 7 days)
                </p>
                {upcomingConsultations.filter((c) => new Date(c.startTime).getTime() <= in7days).length ? (
                  <ul className="flex flex-col gap-1.5">
                    {upcomingConsultations
                      .filter((c) => new Date(c.startTime).getTime() <= in7days)
                      .map((c) => (
                        <li key={c._id} className="flex items-center justify-between rounded bg-shell-bg px-3 py-2 text-sm">
                          <span>{typeof c.customerId === 'object' ? c.customerId.name : c.title}</span>
                          <span className="text-xs text-shell-muted">{formatDateTime(c.startTime)}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-shell-muted">No consultations in the next 7 days.</p>
                )}
              </div>
            ) : null}
            {canRemedies ? (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  <Bell size={13} /> Pending remedies
                </p>
                {pendingRemedies.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {pendingRemedies.slice(0, 8).map((r) => (
                      <li key={r._id} className="flex items-center justify-between rounded bg-shell-bg px-3 py-2 text-sm">
                        <span>{r.remedyName}</span>
                        <span className="text-xs text-shell-muted">{formatDateTime(r.scheduledAt)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-shell-muted">No pending remedies.</p>
                )}
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {/* Mini calendars */}
      {(canConsultations || canRemedies) ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {canConsultations ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5"><CalendarDays size={15} /> Consultations</CardTitle>
              </CardHeader>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: 'title', center: '', right: 'prev,next' }}
                events={consultationCalEvents}
                height={360}
              />
            </Card>
          ) : null}
          {canRemedies ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5"><CalendarDays size={15} /> Remedies</CardTitle>
              </CardHeader>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: 'title', center: '', right: 'prev,next' }}
                events={remedyCalEvents}
                height={360}
              />
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* Coupon usage + payment link status */}
      {(canCoupons || canPaymentLinks) ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {canCoupons ? (
            <Card>
              <CardHeader>
                <CardTitle>Top coupons by usage</CardTitle>
              </CardHeader>
              <div className="h-64">
                {couponChart.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={couponChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6e6ee" />
                      <XAxis dataKey="code" fontSize={11} />
                      <YAxis fontSize={11} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="used" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-shell-muted">No coupon usage yet.</p>
                )}
              </div>
            </Card>
          ) : null}
          {canPaymentLinks ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment links by status</CardTitle>
              </CardHeader>
              <div className="h-64">
                {paymentLinkChart.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentLinkChart} dataKey="count" nameKey="status" outerRadius={90} label>
                        {paymentLinkChart.map((d) => (
                          <Cell key={d.status} fill={PL_COLORS[d.status] ?? '#a855f7'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-shell-muted">No payment links yet.</p>
                )}
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function buildChartData(orders: Order[]) {
  const byStatus: { status: OrderStatus; count: number }[] = (
    ['created', 'scheduled', 'in_progress', 'on_hold', 'completed', 'awaiting_feedback', 'closed', 'cancelled'] as OrderStatus[]
  ).map((s) => ({ status: s, count: orders.filter((o) => o.orderStatus === s).length }))

  const dayMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'd MMM')
    dayMap.set(d, 0)
  }
  for (const o of orders) {
    try {
      const d = format(parseISO(o.createdAt), 'd MMM')
      if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) ?? 0) + 1)
    } catch {
      /* ignore */
    }
  }
  const byDay = Array.from(dayMap.entries()).map(([day, count]) => ({ day, count }))

  const paidRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.pricing?.finalAmount ?? 0), 0)

  return { byStatus, byDay, paidRevenue }
}
