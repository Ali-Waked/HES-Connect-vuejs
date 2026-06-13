import axiosClient from '@/axiosClient'

export function getOrganizationUsers(params = {}) {
  return axiosClient.get('/dashboard/organization-users', { params })
}

export function getOrganizationUser(id) {
  return axiosClient.get(`/dashboard/organization-users/${id}`)
}

export function createOrganizationUser(data) {
  return axiosClient.post('/dashboard/organization-users', data)
}

export function updateOrganizationUser(id, data) {
  return axiosClient.put(`/dashboard/organization-users/${id}`, data)
}

export function deleteOrganizationUser(id) {
  return axiosClient.delete(`/dashboard/organization-users/${id}`)
}

export function getUsers(params = {}) {
  return axiosClient.get('/dashboard/users', { params })
}
