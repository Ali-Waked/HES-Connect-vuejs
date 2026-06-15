import axiosClient from '@/axiosClient'

export function getMessages(params = {}) {
  return axiosClient.get('/admin/contact-messages', { params })
}

export function getMessage(id) {
  return axiosClient.get(`/admin/contact-messages/${id}`)
}

export function updateMessageStatus(id, status) {
  return axiosClient.patch(`/admin/contact-messages/${id}/status`, { status })
}
