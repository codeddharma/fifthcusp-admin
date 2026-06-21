import { toast } from 'sonner'
import { AxiosError } from 'axios'

export class ApiError extends Error {
  status: number
  payload?: unknown
  constructor(status: number, message: string, payload?: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 0
    const message =
      (err.response?.data as { message?: string } | undefined)?.message ?? err.message ?? 'Request failed'
    return new ApiError(status, message, err.response?.data)
  }
  if (err instanceof Error) return new ApiError(0, err.message)
  return new ApiError(0, 'Unknown error')
}

export function toastError(err: unknown, fallback = 'Something went wrong') {
  const e = toApiError(err)
  toast.error(e.message || fallback)
}
