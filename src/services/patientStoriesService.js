import axiosClient from '@/axiosClient'

export function getMyStories(params = {}) {
  return axiosClient.get('/patient/stories', { params })
}

export function getMyStory(id) {
  return axiosClient.get(`/patient/stories/${id}`)
}

export function createMyStory(data) {
  const isFormData = data instanceof FormData
  return axiosClient.post('/patient/stories', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  })
}

export function updateMyStory(id, data) {
  const isFormData = data instanceof FormData
  return axiosClient.post(`/patient/stories/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  })
}

export function deleteMyStory(id) {
  return axiosClient.delete(`/patient/stories/${id}`)
}
