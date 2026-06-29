import axiosClient from '@/axiosClient'

export function getNotifications(params = {}) {
  return axiosClient.get('/notifications', { params })
}

export function markAsRead(uuid) {
  return axiosClient.post('/notifications/read', { uuid })
}

export function markAllAsRead() {
  return axiosClient.post('/notifications/read-all')
}

export function getUnreadCount() {
  return axiosClient.get('/notifications/unread-count')
}

export function deleteNotification(uuid) {
  return axiosClient.delete(`/notifications/${uuid}`)
}
