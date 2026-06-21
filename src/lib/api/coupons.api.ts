import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { Coupon, CreateCouponInput } from '@/types/coupon'

export interface CouponListParams {
  page?: number
  limit?: number
}

export const CouponsApi = {
  list: (params: CouponListParams = {}) =>
    api.get('/coupons', { params }).then((r) => unwrapPaginated<Coupon>(r)),

  create: (input: CreateCouponInput) =>
    api.post('/coupons', input).then((r) => unwrap<Coupon>(r)),

  update: (id: string, input: Partial<CreateCouponInput>) =>
    api.patch(`/coupons/${id}`, input).then((r) => unwrap<Coupon>(r)),

  remove: (id: string) => api.delete(`/coupons/${id}`).then((r) => unwrap<null>(r)),
}
