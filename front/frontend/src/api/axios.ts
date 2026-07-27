import axios from 'axios'

const DEFAULT_API_BASE = '/api/nueva-arquitectura'

function normalizeApiBaseUrl(rawBaseUrl?: string) {
  const value = rawBaseUrl?.trim()

  if (!value) return DEFAULT_API_BASE
  if (value.endsWith('/api/nueva-arquitectura')) return value
  if (value.endsWith('/api')) return `${value}/nueva-arquitectura`
  if (value.includes('/api/nueva-arquitectura/')) return value.replace(/\/+$/, '')

  return `${value.replace(/\/+$/, '')}/api/nueva-arquitectura`
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise: Promise<string> | null = null

function clearSessionAndRedirect() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  const returnTo = `${window.location.pathname}${window.location.search}`
  window.location.href = `/login?sesion=expirada&returnTo=${encodeURIComponent(returnTo)}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          refreshPromise ??= axios
            .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
            .then(({ data }) => {
              if (!data.accessToken) throw new Error('El backend no devolvió un token de acceso')
              localStorage.setItem('accessToken', data.accessToken)
              if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
              return data.accessToken as string
            })
            .finally(() => { refreshPromise = null })
          const accessToken = await refreshPromise
          original.headers.Authorization = `Bearer ${accessToken}`
          return api(original)
        } catch {
          clearSessionAndRedirect()
        }
      } else {
        clearSessionAndRedirect()
      }
    }
    return Promise.reject(error)
  }
)

export default api
