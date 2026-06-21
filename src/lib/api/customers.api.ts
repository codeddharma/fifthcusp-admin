import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '@/types/customer'

export interface CustomerListParams {
  page?: number
  limit?: number
  search?: string
}

export const CustomersApi = {
  list: (params: CustomerListParams = {}) =>
    api.get('/customers', { params }).then((r) => unwrapPaginated<Customer>(r)),

  get: (id: string) => api.get(`/customers/${id}`).then((r) => unwrap<Customer>(r)),

  create: (input: CreateCustomerInput) =>
    api.post('/customers', input).then((r) => unwrap<Customer>(r)),

  update: (id: string, input: UpdateCustomerInput) =>
    api.patch(`/customers/${id}`, input).then((r) => unwrap<Customer>(r)),
}
