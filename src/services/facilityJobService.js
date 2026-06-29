import axiosClient from '@/axiosClient'
import { useWorkspaceStore } from '@/stores/workspace'

function getFacilityUuid() {
  try {
    const store = useWorkspaceStore()
    return store.currentFacility?.uuid
  } catch {
    return null
  }
}

function hasFiles(data) {
  return Object.values(data).some(v => v instanceof File)
}

function toFormData(data) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue
    if (value instanceof File) {
      fd.append(key, value)
    } else if (typeof value === 'object') {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (subValue !== null && subValue !== undefined) {
          fd.append(`${key}[${subKey}]`, String(subValue))
        }
      }
    } else {
      fd.append(key, String(value))
    }
  }
  return fd
}

function baseUrl() {
  return `/facility/${getFacilityUuid()}/job-posts`
}

export function getJobPosts(params = {}) {
  return axiosClient.get(baseUrl(), { params })
}

export function getJobPost(id) {
  return axiosClient.get(`${baseUrl()}/${id}`)
}

export function createJobPost(data) {
  const payload = hasFiles(data) ? toFormData(data) : data
  return axiosClient.post(baseUrl(), payload)
}

export function updateJobPost(id, data) {
  if (hasFiles(data)) {
    const fd = toFormData(data)
    fd.append('_method', 'PUT')
    return axiosClient.post(`${baseUrl()}/${id}`, fd)
  }
  return axiosClient.put(`${baseUrl()}/${id}`, data)
}

export function deleteJobPost(id) {
  return axiosClient.delete(`${baseUrl()}/${id}`)
}

export function getJobPostStats() {
  return axiosClient.get(`${baseUrl()}/stats`)
}
