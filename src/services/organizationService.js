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
    type: formData.type,
  }
}


export function getOrganizations(params = {}) {
  return axiosClient.get('/dashboard/organizations', { params })
}

export function getOrganization(id) {
  return axiosClient.get(`/dashboard/organizations/${id}`)
}

export function createOrganization(data) {
  return axiosClient.post('/dashboard/organizations', toPayload(data))
}

export function updateOrganization(id, data) {
  return axiosClient.put(`/dashboard/organizations/${id}`, toPayload(data))
}

export function deleteOrganization(id) {
  return axiosClient.delete(`/dashboard/organizations/${id}`)
}

export function getOrganizationStats() {
  return axiosClient.get('/dashboard/organizations/stats')
}
