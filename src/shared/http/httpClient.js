import axios from 'axios'
import { errorHandler } from './errorHandler'

let storeProvider = null

export function setAuthStoreProvider(fn) {
  storeProvider = fn
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  const lang = localStorage.getItem('lang') || 'en'
  config.headers['Accept-Language'] = lang

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      if (storeProvider) {
        const auth = storeProvider()
        auth.clearAuth()
      }
      window.location.href = '/login?expired=1'
      return Promise.reject(error)
    }
    return Promise.reject(errorHandler(error))
  }
)

export default httpClient
