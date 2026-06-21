export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  pagination?: PaginationMeta
}

export interface Paginated<T> {
  items: T[]
  pagination: PaginationMeta
}
