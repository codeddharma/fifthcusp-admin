import { AxiosResponse } from 'axios'
import type { ApiEnvelope, Paginated, PaginationMeta } from '@/types/api'

export function unwrap<T>(res: AxiosResponse<ApiEnvelope<T>>): T {
  return res.data.data
}

export function unwrapPaginated<T>(res: AxiosResponse<ApiEnvelope<T[]>>): Paginated<T> {
  const pagination: PaginationMeta = res.data.pagination ?? {
    page: 1,
    limit: (res.data.data ?? []).length,
    total: (res.data.data ?? []).length,
    totalPages: 1,
  }
  return { items: res.data.data ?? [], pagination }
}
