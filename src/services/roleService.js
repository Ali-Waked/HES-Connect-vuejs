import axiosClient from '@/axiosClient'

export function getRoles(params = {}) {
  return axiosClient.get('/dashboard/roles', { params })
}

export function getRole(id) {
  return axiosClient.get(`/dashboard/roles/${id}`)
}

export function createRole(data) {
  console.log(data.permissions);
  return axiosClient.post('/dashboard/roles', {
    name: data.name,
    permissions: data.permissions,
  })
}

export function updateRole(id, data) {
  return axiosClient.put(`/dashboard/roles/${id}`, {
    name: data.name,
    permissions: data.permissions,
  })
}

export function deleteRole(uuid) {
  return axiosClient.delete(`/dashboard/roles/${uuid}`)
}

export function getRoleStats() {
  return axiosClient.get('/dashboard/roles/stats')
}

