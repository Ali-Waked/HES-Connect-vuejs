import axiosClient from '@/axiosClient'

export function createCheckoutSession(donationId, data) {
  return axiosClient.post(`/public/payments/stripe/checkout/${donationId}`, data)
}

export function verifyPayment(sessionId) {
  return axiosClient.get(`/public/payments/verify/${sessionId}`)
}

export function checkDonationStatus(sessionId) {
  return axiosClient.get('/donations/status', {
    params: { session_id: sessionId },
  })
}
