import { api } from './client'
import { unwrap } from './unwrap'
import type { DisclaimerBanner, DisclaimerBannerInput } from '@/types/disclaimerBanner'

export const DisclaimerBannerApi = {
  get: () => api.get('/disclaimer-banner').then((r) => unwrap<DisclaimerBanner | null>(r)),

  update: (input: DisclaimerBannerInput) =>
    api.put('/disclaimer-banner', input).then((r) => unwrap<DisclaimerBanner>(r)),
}
