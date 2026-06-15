import axiosClient from '@/axiosClient'

function toPayload(formData) {
  return {
    name: {
      en: formData.name_en,
      ar: formData.name_ar,
    },
    is_active: formData.is_active,
  }
}

export function getCities(params = {}) {
  return axiosClient.get('/dashboard/cities', { params })
}

export function getCity(uuid) {
  return axiosClient.get(`/dashboard/cities/${uuid}`)
}

export function createCity(data) {
  return axiosClient.post('/dashboard/cities', toPayload(data))
}

export function updateCity(uuid, data) {
  return axiosClient.put(`/dashboard/cities/${uuid}`, toPayload(data))
}

export function deleteCity(uuid) {
  return axiosClient.delete(`/dashboard/cities/${uuid}`)
}

export function getCitiesLookup() {
  return axiosClient.get('/cities/list')
}
