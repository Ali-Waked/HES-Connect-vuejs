import axiosClient from '@/axiosClient'

function toFormData(data) {
  const fd = new FormData()

  fd.append('name[en]', data.name_en || data.name?.en || '')
  fd.append('name[ar]', data.name_ar || data.name?.ar || '')
  fd.append('description[en]', data.description_en || data.description?.en || '')
  fd.append('description[ar]', data.description_ar || data.description?.ar || '')

  if (data.image instanceof File) {
    fd.append('image', data.image)
  }

  return fd
}

export function getMedicines(params = {}) {
  return axiosClient.get('/dashboard/medicines', { params })
}

export function getMedicine(uuid) {
  return axiosClient.get(`/dashboard/medicines/${uuid}`)
}

export function createMedicine(data) {
  return axiosClient.post('/dashboard/medicines', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateMedicine(uuid, data) {
  const fd = toFormData(data)
  fd.append('_method', 'PUT')
  return axiosClient.post(`/dashboard/medicines/${uuid}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function deleteMedicine(uuid) {
  return axiosClient.delete(`/dashboard/medicines/${uuid}`)
}

export function lookupMedicines(params = {}) {
  return axiosClient.get('/dashboard/medicines/lookup', { params })
}
