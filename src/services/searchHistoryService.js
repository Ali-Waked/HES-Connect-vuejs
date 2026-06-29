import axiosClient from '@/axiosClient'

export function getSearchHistories(params = {}) {
  return axiosClient.get('/dashboard/search-histories', { params })
}

export function createSearchHistory(data) {
  return axiosClient.post('/dashboard/search-histories', data)
}

export function deleteSearchHistory(uuid) {
  return axiosClient.delete(`/dashboard/search-histories/${uuid}`)
}

export function clearAllSearchHistories() {
  return axiosClient.delete('/dashboard/search-histories')
}

export function getTrendingSearches(params = {}) {
  return axiosClient.get('/dashboard/search-histories/trending', { params })
}
