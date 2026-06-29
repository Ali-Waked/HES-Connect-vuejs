import axiosClient from '@/axiosClient'

export function subscribe(data) {
  return axiosClient.post('/public/subscriptions', data)
}

export function verifyToken(token) {
  return axiosClient.get(`/public/subscriptions/verify/${token}`)
}

export function updateTypes(token, types) {
  return axiosClient.patch(`/public/subscriptions/${token}`, { types })
}

export function unsubscribe(token) {
  return axiosClient.post(`/public/subscriptions/unsubscribe/${token}`)
}
