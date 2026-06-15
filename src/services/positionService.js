import axiosClient from '@/axiosClient'

function toPayload(formData) {
  return {
    name: {
      en: formData.name_en,
      ar: formData.name_ar,
    },
    description: {
      en: formData.description_en,
      ar: formData.description_ar,
    },
    is_active: formData.is_active,
  }
}

export function getPositions(params = {}) {
  return axiosClient.get('/dashboard/positions', { params })
}

export function getPosition(uuid) {
  return axiosClient.get(`/dashboard/positions/${uuid}`)
}

export function createPosition(data) {
  return axiosClient.post('/dashboard/positions', toPayload(data))
}

export function updatePosition(uuid, data) {
  return axiosClient.put(`/dashboard/positions/${uuid}`, toPayload(data))
}

export function deletePosition(uuid) {
  return axiosClient.delete(`/dashboard/positions/${uuid}`)
}

export function getPositionStats() {
  return axiosClient.get('/dashboard/positions/stats')
}

export function getPositionsLookup() {
  return axiosClient.get('/dashboard/positions/lookup')
}
