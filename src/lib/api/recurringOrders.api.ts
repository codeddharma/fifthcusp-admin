import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { RecurringOrder, RecurringOrderStatus, CreateRecurringOrderInput } from '@/types/recurringOrder'

export interface RecurringOrderListParams {
  page?: number
  limit?: number
}

export const RecurringOrdersApi = {
  list: (params: RecurringOrderListParams = {}) =>
    api.get('/recurring-orders', { params }).then((r) => unwrapPaginated<RecurringOrder>(r)),

  get: (id: string) => api.get(`/recurring-orders/${id}`).then((r) => unwrap<RecurringOrder>(r)),

  create: (input: CreateRecurringOrderInput) =>
    api.post('/recurring-orders', input).then((r) => unwrap<RecurringOrder>(r)),

  updateStatus: (id: string, status: RecurringOrderStatus) =>
    api.patch(`/recurring-orders/${id}/status`, { status }).then((r) => unwrap<RecurringOrder>(r)),
}
