import axiosClient from '@/axiosClient'

export function getDonations(params = {}) {
  return axiosClient.get('/public/donations', { params })
}

export function getDonation(uuid) {
  return axiosClient.get(`/public/donations/${uuid}`)
}

export function createDonation(data) {
  return axiosClient.post('/public/donations', data)
}

export function createDonationCheckout(storyId, data) {
  return axiosClient.post(`/public/donations/${storyId}/checkout`, data)
}
