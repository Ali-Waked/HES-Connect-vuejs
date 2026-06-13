import axiosClient from '@/axiosClient'

export function getTags(params = {}) {
  return axiosClient.get('/dashboard/tags', { params })
}

export function getTag(uuid) {
  return axiosClient.get(`/dashboard/tags/${uuid}`)
}

export function createTag(data) {
  return axiosClient.post('/dashboard/tags', {
    name: { en: data.name_en, ar: data.name_ar },
  })
}

export function updateTag(uuid, data) {
  return axiosClient.put(`/dashboard/tags/${uuid}`, {
    name: { en: data.name_en, ar: data.name_ar },
  })
}

export function deleteTag(uuid) {
  return axiosClient.delete(`/dashboard/tags/${uuid}`)
}

export function getTagStats() {
  return axiosClient.get('/dashboard/tags/stats')
}
