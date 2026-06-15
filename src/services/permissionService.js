import axiosClient from '@/axiosClient'

export function getPermissions(params = {}) {
  return axiosClient.get('/dashboard/permissions', { params })
}

export function getPermission(id) {
  return axiosClient.get(`/dashboard/permissions/${id}`)
}

export function createPermission(data) {
  return axiosClient.post('/dashboard/permissions', {
    name: data.name,
    module: data.module,
  })
}

export function updatePermission(id, data) {
  return axiosClient.put(`/dashboard/permissions/${id}`, {
    name: data.name,
    module: data.module,
  })
}

export function deletePermission(id) {
  return axiosClient.delete(`/dashboard/permissions/${id}`)
}

export function getPermissionStats() {
  return axiosClient.get('/dashboard/permissions/stats')
}
