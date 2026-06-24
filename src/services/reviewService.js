import axiosClient from '@/axiosClient'

export function createReview(appointmentUuid, data) {
  return axiosClient.post(`/reviews/${appointmentUuid}`, data)
}

export function getReviews(params = {}) {
  return axiosClient.get('/dashboard/reviews', { params })
}

export function getReviewStats() {
  return axiosClient.get('/dashboard/reviews/stats')
}

export function showReview(uuid) {
  return axiosClient.patch(`/dashboard/reviews/${uuid}/show`)
}

export function hideReview(uuid) {
  return axiosClient.patch(`/dashboard/reviews/${uuid}/hide`)
}

export function deleteReview(uuid) {
  return axiosClient.delete(`/dashboard/reviews/${uuid}`)
}

export function replyToReview(uuid, data) {
  return axiosClient.post(`/dashboard/reviews/${uuid}/reply`, data)
}

export function getFacilityReviews(params = {}) {
  return axiosClient.get('/dashboard/facility-reviews', { params })
}

export function showFacilityReview(uuid) {
  return axiosClient.patch(`/dashboard/facility-reviews/${uuid}/show`)
}

export function hideFacilityReview(uuid) {
  return axiosClient.patch(`/dashboard/facility-reviews/${uuid}/hide`)
}
