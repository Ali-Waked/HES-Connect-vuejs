import axiosClient from '@/axiosClient'

export function getNotifications(params = {}) {
  return axiosClient.get('/notifications', { params })
}

export function getUnread() {
  return axiosClient.get('/notifications/unread')
}

export function getUnreadCount() {
  return axiosClient.get('/notifications/unread-count')
}

export function markAsRead(uuid) {
  return axiosClient.post(`/notifications/${uuid}/read`)
}

export function markAllAsRead() {
  return axiosClient.post('/notifications/read-all')
}

export function deleteNotification(uuid) {
  return axiosClient.delete(`/notifications/${uuid}`)
}

export function deleteAll() {
  return axiosClient.delete('/notifications')
}
