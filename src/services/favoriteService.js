import axiosClient from '@/axiosClient'

const pendingRequests = new Map()

function getCancelKey(type, id) {
  return `${type}:${id}`
}

export function cancelPending(type, id) {
  const key = getCancelKey(type, id)
  if (pendingRequests.has(key)) {
    pendingRequests.get(key).abort()
    pendingRequests.delete(key)
  }
}

export function getFavorites(params = {}) {
  return axiosClient.get('/favorites', { params })
}

export function addFavorite(data) {
  return axiosClient.post('/favorites', data)
}

export function removeFavorite(id) {
  return axiosClient.delete(`/favorites/${id}`)
}

export function toggleFavorite(type, entityId) {
  const key = getCancelKey(type, entityId)
  cancelPending(type, entityId)
  const controller = new AbortController()
  pendingRequests.set(key, controller)
  return axiosClient.post('/favorites/toggle', { type, id: entityId }, { signal: controller.signal })
    .finally(() => { pendingRequests.delete(key) })
}
