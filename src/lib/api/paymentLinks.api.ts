import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { PaymentLink, CreatePaymentLinkInput } from '@/types/paymentLink'

export interface PaymentLinkListParams {
  page?: number
  limit?: number
}

export const PaymentLinksApi = {
  list: (params: PaymentLinkListParams = {}) =>
    api.get('/payment-links', { params }).then((r) => unwrapPaginated<PaymentLink>(r)),

  get: (id: string) => api.get(`/payment-links/${id}`).then((r) => unwrap<PaymentLink>(r)),

  create: (input: CreatePaymentLinkInput) =>
    api.post('/payment-links', input).then((r) => unwrap<PaymentLink>(r)),

  cancel: (id: string) =>
    api.patch(`/payment-links/${id}/cancel`).then((r) => unwrap<PaymentLink>(r)),
}
