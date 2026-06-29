import axiosClient from '@/axiosClient'

export function getDonations(params = {}) {
  return axiosClient.get('/dashboard/donations', { params })
}

export function getDonation(uuid) {
  return axiosClient.get(`/dashboard/donations/${uuid}`)
}

export function getDonationStats() {
  return axiosClient.get('/dashboard/donations/stats')
}
