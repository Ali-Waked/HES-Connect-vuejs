import axiosClient from '@/axiosClient'

export function createCheckoutSession(data) {
  return axiosClient.post('/public/payments/stripe/checkout', data)
}
