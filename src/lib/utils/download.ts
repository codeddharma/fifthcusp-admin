import { env } from '../env'
import { getAccessToken } from '../api/tokenStore'
import { refreshAccessTokenOnce } from '../api/refreshQueue'

async function authedFetch(url: string): Promise<Response> {
  const token = getAccessToken()
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (res.status !== 401) return res
  try {
    const newToken = await refreshAccessTokenOnce()
    return fetch(url, { headers: { Authorization: `Bearer ${newToken}` } })
  } catch {
    window.dispatchEvent(new CustomEvent('auth:logout'))
    throw new Error('Session expired')
  }
}

export async function downloadOrderFile(
  orderId: string,
  fieldKey: string,
  addOnKey: string | undefined,
  suggestedName: string,
) {
  const params = addOnKey ? `?addOnKey=${encodeURIComponent(addOnKey)}` : ''
  const url = `${env.API_URL}/orders/admin/${orderId}/files/${encodeURIComponent(fieldKey)}${params}`
  const res = await authedFetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Download failed (${res.status})`)
  }
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = suggestedName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
