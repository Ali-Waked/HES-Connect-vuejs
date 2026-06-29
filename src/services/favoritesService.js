import axiosClient from '@/axiosClient'

export function getFavorites(params = {}) {
  return axiosClient.get('/favorites', { params })
}

export function addFavorite(data) {
  return axiosClient.post('/favorites', data)
}

export function removeFavorite(id) {
  return axiosClient.delete(`/favorites/${id}`)
}
