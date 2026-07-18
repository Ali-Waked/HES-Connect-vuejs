import axiosClient from '@/axiosClient'

// Legacy single-message endpoint (kept for backward compat)
export function sendConsultationMessage(data) {
  return axiosClient.post('/patient/ai/consultation', data)
}

// Conversation-based endpoints
export function getAiConversations(params = {}) {
  return axiosClient.get('/patient/ai/conversations', { params })
}

export function createAiConversation(data = {}) {
  return axiosClient.post('/patient/ai/conversations', data)
}

export function getAiConversation(uuid, params = {}) {
  return axiosClient.get(`/patient/ai/conversations/${uuid}`, { params })
}

export function sendAiMessage(uuid, data) {
  return axiosClient.post(`/patient/ai/conversations/${uuid}/messages`, data)
}

export function deleteAiConversation(uuid) {
  return axiosClient.delete(`/patient/ai/conversations/${uuid}`)
}

export function renameAiConversation(uuid, data) {
  return axiosClient.put(`/patient/ai/conversations/${uuid}`, data)
}

export function recommendDoctor(uuid) {
  return axiosClient.post(`/patient/ai/conversations/${uuid}/recommend-doctor`)
}
