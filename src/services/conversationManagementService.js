import axiosClient from '@/axiosClient'

export function getConversations(params = {}) {
  return axiosClient.get('/admin/conversations', { params })
}

export function getConversationDetails(id) {
  return axiosClient.get(`/admin/conversations/${id}`)
}

export function getConversationStats() {
  return axiosClient.get('/admin/conversations/stats')
}

export function archiveConversation(id) {
  return axiosClient.post(`/admin/conversations/${id}/archive`)
}

export function lockConversation(id) {
  return axiosClient.post(`/admin/conversations/${id}/lock`)
}
