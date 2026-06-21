export const env = {
  API_URL: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api/v1',
}
