import axiosClient from '@/axiosClient'

function toFormData(formData) {
  const payload = new FormData()

  payload.append('name[en]', formData.name_en)
  payload.append('name[ar]', formData.name_ar)
  payload.append('description[en]', formData.description_en || '')
  payload.append('description[ar]', formData.description_ar || '')
  payload.append('facility_id', formData.facility_id)
  payload.append('head_id', formData.head_id || '')
  payload.append('is_active', formData.is_active ? 1 : 0)

  if (formData.image instanceof File) {
    payload.append('image', formData.image)
  }

  return payload
}

export function getDepartments(params = {}) {
  return axiosClient.get('/dashboard/departments', { params })
}

export function getDepartment(id) {
  return axiosClient.get(`/dashboard/departments/${id}`)
}

export function createDepartment(data) {
  const payload = toFormData(data)
  return axiosClient.post('/dashboard/departments', payload)
}

export function updateDepartment(id, data) {
  const payload = toFormData(data)
  payload.append('_method', 'PUT')
  return axiosClient.post(`/dashboard/departments/${id}`, payload)
}

export function deleteDepartment(id) {
  return axiosClient.delete(`/dashboard/departments/${id}`)
}

export function getDepartmentStats() {
  return axiosClient.get('/dashboard/departments/stats')
}
