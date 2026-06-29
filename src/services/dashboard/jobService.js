import axiosClient from '@/axiosClient'

export function getJobs(params = {}) {
  return axiosClient.get('/dashboard/job-posts', { params })
}

export function getJob(id) {
  return axiosClient.get(`/dashboard/job-posts/${id}`)
}

function toFormData(data) {
  const fd = new FormData()
  fd.append('facility_id', data.facility_id)
  fd.append('title[en]', data.title?.en || '')
  fd.append('title[ar]', data.title?.ar || '')
  fd.append('content[en]', data.content?.en || '')
  fd.append('content[ar]', data.content?.ar || '')
  fd.append('category_id', data.category_id)
  fd.append('employment_type', data.employment_type)
  fd.append('experience_level', data.experience_level)
  if (data.location) fd.append('location', data.location)
  if (data.salary_from != null) fd.append('salary_from', data.salary_from)
  if (data.salary_to != null) fd.append('salary_to', data.salary_to)
  if (data.salary_currency) fd.append('salary_currency', data.salary_currency)
  fd.append('is_salary_visible', data.is_salary_visible ? '1' : '0')
  if (data.vacancies != null) fd.append('vacancies', data.vacancies)
  fd.append('status', data.status || 'pending')
  fd.append('end_date', data.end_date)
  fd.append('apply_method', data.apply_method)
  fd.append('apply_value', data.apply_value)
  if (data.cover_image) {
    fd.append('cover_image', data.cover_image)
  }
  return fd
}

export function createJob(data) {
  const payload = data.cover_image ? toFormData(data) : data
  return axiosClient.post('/dashboard/job-posts', payload)
}

export function updateJob(id, data) {
  const payload = data.cover_image ? toFormData(data) : data
  if (payload instanceof FormData) {
    payload.append('_method', 'PUT')
    return axiosClient.post(`/dashboard/job-posts/${id}`, payload)
  }
  return axiosClient.put(`/dashboard/job-posts/${id}`, payload)
}

export function deleteJob(id) {
  return axiosClient.delete(`/dashboard/job-posts/${id}`)
}

export function approveJob(id) {
  return axiosClient.patch(`/dashboard/job-posts/${id}/approve`)
}

export function rejectJob(id) {
  return axiosClient.patch(`/dashboard/job-posts/${id}/reject`)
}

export function getJobStats() {
  return axiosClient.get('/dashboard/job-posts/stats')
}
