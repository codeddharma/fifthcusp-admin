import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { Order, OrderListFilters, OrderStatus } from '@/types/order'

export interface DeadlinesResult {
  overdue: Order[]
  dueSoon: Order[]
}

export const OrdersApi = {
  list: (filters: OrderListFilters = {}) =>
    api.get('/orders/admin/list', { params: filters }).then((r) => unwrapPaginated<Order>(r)),

  get: (id: string) => api.get(`/orders/admin/${id}`).then((r) => unwrap<Order>(r)),

  updateStatus: (id: string, orderStatus: OrderStatus, note?: string) =>
    api.patch(`/orders/admin/${id}/status`, { orderStatus, note }).then((r) => unwrap<Order>(r)),

  assign: (id: string, userId: string | null) =>
    api.patch(`/orders/admin/${id}/assign`, { userId }).then((r) => unwrap<Order>(r)),

  purgeFiles: () => api.post('/orders/admin/purge-files').then((r) => unwrap<{ purged: number }>(r)),

  getDeadlines: () => api.get('/orders/admin/deadlines').then((r) => unwrap<DeadlinesResult>(r)),

  uploadOutputFile: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/orders/admin/${id}/output-files`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => unwrap<Order>(r))
  },

  sendCompletionEmail: (id: string) =>
    api.post(`/orders/admin/${id}/send-completion-email`).then((r) => unwrap<Order>(r)),

  bulkFeedbackEmail: () =>
    api.post('/orders/admin/bulk-feedback-email').then((r) => unwrap<{ sent: number; skipped: number }>(r)),

  // Public lookup (admin can still use it to verify a customer's order status by number)
  getStatusByNumber: (orderNumber: string) =>
    api.get(`/orders/${orderNumber}/status`).then((r) => unwrap<Order>(r)),
}
