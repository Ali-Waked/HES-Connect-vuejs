import axiosClient from '@/axiosClient'

export function getPayments(params = {}) {
  return axiosClient.get('/dashboard/payments', { params })
}

export function getPayment(uuid) {
  return axiosClient.get(`/dashboard/payments/${uuid}`)
}

export function getPaymentStats() {
  return axiosClient.get('/dashboard/payments/stats')
}

export function getPaymentAnalytics() {
  return axiosClient.get('/dashboard/payments/analytics')
}
