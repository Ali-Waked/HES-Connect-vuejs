import axiosClient from '@/axiosClient'

export function getStories(params = {}) {
  return axiosClient.get('/dashboard/stories', { params })
}

export function getStoryStats() {
  return axiosClient.get('/dashboard/stories/stats')
}

export function getStory(id) {
  return axiosClient.get(`/dashboard/stories/${id}`)
}

export function updateStoryStatus(id, status) {
  return axiosClient.patch(`/dashboard/stories/${id}/status`, { status })
}

export function deleteStory(id) {
  return axiosClient.delete(`/dashboard/stories/${id}`)
}

export function getTrashStories(params = {}) {
  return axiosClient.get('/dashboard/stories/trash', { params })
}

export function restoreStory(id) {
  return axiosClient.post(`/dashboard/stories/${id}/restore`)
}

export function forceDeleteStory(id) {
  return axiosClient.delete(`/dashboard/stories/${id}/force`)
}
