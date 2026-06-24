import axiosClient from '@/axiosClient'

export function getConversations(params = {}) {
  return axiosClient.get('/conversations', { params })
}

export function createConversation(data) {
  return axiosClient.post('/conversations', data)
}

export function findOrCreateConversation(data) {
  return axiosClient.post('/conversations/find-or-create', data)
}

export function getConversation(id, params = {}) {
  return axiosClient.get(`/conversations/${id}`, { params })
}

export function sendMessage(conversationId, data) {
  return axiosClient.post(`/conversations/${conversationId}/messages`, data)
}

export function markAsRead(conversationId) {
  return axiosClient.post(`/conversations/${conversationId}/read`)
}
