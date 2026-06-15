import axiosClient from '@/axiosClient'

function toFormData(formData) {
  const payload = new FormData()

  payload.append('name[en]', formData.name_en)
  payload.append('name[ar]', formData.name_ar)
  payload.append('description[en]', formData.description_en || '')
  payload.append('description[ar]', formData.description_ar || '')
  payload.append('facility_type', formData.type)
  payload.append('organization_id', formData.organization_id)
  payload.append('city_id', formData.city_id || '')
  payload.append('parent_id', formData.parent_id || '')

  const [latitude, longitude] = (formData.location || '')
    .split(',')
    .map(Number)

  if (!Number.isNaN(latitude)) {
    payload.append('latitude', latitude)
  }
  if (!Number.isNaN(longitude)) {
    payload.append('longitude', longitude)
  }

  payload.append('status', formData.status || 'pending')
  payload.append('approval_status', formData.approval_status || 'pending')

  if (formData.cover_image instanceof File) {
    payload.append('cover_image', formData.cover_image)
  }

  if (formData.gallery_images && formData.gallery_images.length > 0) {
    formData.gallery_images.forEach((file) => {
      if (file instanceof File) {
        payload.append('gallery_images[]', file)
      }
    })
  }

  if (formData.files && formData.files.length > 0) {
    formData.files.forEach((file) => {
      if (file instanceof File) {
        payload.append('files[]', file)
      }
    })
  }

  return payload
}

export function getFacilities(params = {}) {
  return axiosClient.get('/dashboard/facilities', { params })
}

export function getFacility(id) {
  return axiosClient.get(`/dashboard/facilities/${id}`)
}

export function createFacility(data) {
  const payload = toFormData(data)
  return axiosClient.post('/dashboard/facilities', payload)
}

export function updateFacility(id, data) {
  const payload = toFormData(data)
  payload.append('_method', 'PUT')
  return axiosClient.post(`/dashboard/facilities/${id}`, payload)
}

export function deleteFacility(id) {
  return axiosClient.delete(`/dashboard/facilities/${id}`)
}

export function getFacilityStats() {
  return axiosClient.get('/dashboard/facilities/stats')
}


