import axiosClient from '@/axiosClient'

export function getCategories(params = {}) {
  return axiosClient.get('/dashboard/categories', { params })
}

export function getCategory(uuid) {
  return axiosClient.get(`/dashboard/categories/${uuid}`)
}

export function createCategory(data) {
  return axiosClient.post('/dashboard/categories', {
    name: { en: data.name_en, ar: data.name_ar },
    description: { en: data.description_en || '', ar: data.description_ar || '' },
    type: data.type,
    is_active: data.is_active ?? true,
  })
}

export function updateCategory(uuid, data) {
  return axiosClient.put(`/dashboard/categories/${uuid}`, {
    name: { en: data.name_en, ar: data.name_ar },
    description: { en: data.description_en || '', ar: data.description_ar || '' },
    type: data.type,
    is_active: data.is_active ?? true,
  })
}

export function deleteCategory(uuid) {
  return axiosClient.delete(`/dashboard/categories/${uuid}`)
}

export function getCategoryStats() {
  return axiosClient.get('/dashboard/categories/stats')
}
