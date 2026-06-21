export const qk = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: (params: unknown) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  services: {
    all: () => ['services'] as const,
    list: (params: unknown) => ['services', 'list', params] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
  },
  orders: {
    all: () => ['orders'] as const,
    list: (params: unknown) => ['orders', 'list', params] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  customers: {
    all: () => ['customers'] as const,
    list: (params: unknown) => ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
  },
  blogs: {
    all: () => ['blogs'] as const,
    list: (params: unknown) => ['blogs', 'list', params] as const,
    detail: (id: string) => ['blogs', 'detail', id] as const,
  },
  faqs: {
    all: () => ['faqs'] as const,
    list: (params: unknown) => ['faqs', 'list', params] as const,
    detail: (id: string) => ['faqs', 'detail', id] as const,
    byPage: (page: string) => ['faqs', 'page', page] as const,
  },
  testimonials: {
    all: () => ['testimonials'] as const,
    list: (params: unknown) => ['testimonials', 'list', params] as const,
    detail: (id: string) => ['testimonials', 'detail', id] as const,
  },
  careers: {
    all: () => ['careers'] as const,
    list: (params: unknown) => ['careers', 'list', params] as const,
    detail: (id: string) => ['careers', 'detail', id] as const,
  },
  content: {
    all: () => ['content'] as const,
    list: () => ['content', 'list'] as const,
    detail: (page: string) => ['content', 'detail', page] as const,
  },
  pageMeta: {
    all: () => ['pageMeta'] as const,
    list: () => ['pageMeta', 'list'] as const,
  },
  coupons: {
    all: () => ['coupons'] as const,
    list: (params: unknown) => ['coupons', 'list', params] as const,
    detail: (id: string) => ['coupons', 'detail', id] as const,
  },
  paymentLinks: {
    all: () => ['paymentLinks'] as const,
    list: (params: unknown) => ['paymentLinks', 'list', params] as const,
    detail: (id: string) => ['paymentLinks', 'detail', id] as const,
  },
  recurringOrders: {
    all: () => ['recurringOrders'] as const,
    list: (params: unknown) => ['recurringOrders', 'list', params] as const,
    detail: (id: string) => ['recurringOrders', 'detail', id] as const,
  },
  availabilityWindows: {
    all: () => ['availabilityWindows'] as const,
    list: () => ['availabilityWindows', 'list'] as const,
  },
  consultationEvents: {
    all: () => ['consultationEvents'] as const,
    list: (params: unknown) => ['consultationEvents', 'list', params] as const,
  },
  remedyEvents: {
    all: () => ['remedyEvents'] as const,
    list: (params: unknown) => ['remedyEvents', 'list', params] as const,
  },
}
