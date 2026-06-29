import axiosClient from '@/axiosClient'

export function getConversations(params = {}) {
  return axiosClient.get('/dashboard/conversations', { params })
}

export function getConversationDetails(id) {
  return axiosClient.get(`/dashboard/conversations/${id}`)
}

export function getConversationStats() {
  return axiosClient.get('/dashboard/conversations/stats')
}

export function archiveConversation(id) {
  return axiosClient.patch(`/dashboard/conversations/${id}/archive`)
}

export function lockConversation(id) {
  return axiosClient.patch(`/dashboard/conversations/${id}/lock`)
}
