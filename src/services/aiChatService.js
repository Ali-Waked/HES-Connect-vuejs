import axiosClient from '@/axiosClient'

const BASE = '/dashboard/ai'

export function askQuestion(data) {
  return axiosClient.post(`${BASE}/ask`, data)
}

export function getConversations(params = {}) {
  return axiosClient.get(`${BASE}/conversations`, { params })
}

export function getConversation(uuid) {
  return axiosClient.get(`${BASE}/conversations/${uuid}`)
}

export function renameConversation(uuid, data) {
  return axiosClient.patch(`${BASE}/conversations/${uuid}`, data)
}

export function deleteConversation(uuid) {
  return axiosClient.delete(`${BASE}/conversations/${uuid}`)
}
