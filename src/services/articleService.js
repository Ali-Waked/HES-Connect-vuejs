import axiosClient from '@/axiosClient'

function toFormData(formData) {
  const payload = new FormData()

  payload.append('title[en]', formData.title_en)
  payload.append('title[ar]', formData.title_ar)
  payload.append('content[en]', formData.content_en || '')
  payload.append('content[ar]', formData.content_ar || '')
  payload.append('category_id', formData.category_id)
  payload.append('status', formData.status || 'draft')

  if (formData.tags && formData.tags.length > 0) {
    formData.tags.forEach((tagId) => {
      payload.append('tags[]', tagId)
    })
  }

  if (formData.cover_image) {
    payload.append('cover_image', formData.cover_image)
  }

  return payload
}

export function getArticles(params = {}) {
  return axiosClient.get('/dashboard/articles', { params })
}

export function getArticle(id) {
  return axiosClient.get(`/dashboard/articles/${id}`)
}

export function createArticle(data) {
  const payload = toFormData(data)
  return axiosClient.post('/dashboard/articles', payload)
}

export function updateArticle(id, data) {
  const payload = toFormData(data)
  payload.append('_method', 'PUT')
  return axiosClient.post(`/dashboard/articles/${id}`, payload)
}

export function deleteArticle(id) {
  return axiosClient.delete(`/dashboard/articles/${id}`)
}

export function updateArticleStatus(id, status) {
  return axiosClient.post(`/dashboard/articles/${id}`, { _method: 'PUT', status })
}

export function getArticleStats() {
  return axiosClient.get('/dashboard/articles/stats')
}

export function getCategories() {
  return axiosClient.get('/dashboard/categories')
}

export function getTags() {
  return axiosClient.get('/dashboard/tags')
}
