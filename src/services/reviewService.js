import axiosClient from '@/axiosClient'

export function createReview(appointmentUuid, data) {
  return axiosClient.post(`/reviews/${appointmentUuid}`, data)
}

// ── Platform Reviews ─────────────────────

export function getReviews(params = {}) {
  return axiosClient.get('/dashboard/platform-reviews', { params })
}

export function getReviewStats() {
  return axiosClient.get('/dashboard/platform-reviews/stats')
}

export function showReview(id) {
  return axiosClient.put(`/dashboard/platform-reviews/${id}`, { status: 'approved' })
}

export function hideReview(id) {
  return axiosClient.put(`/dashboard/platform-reviews/${id}`, { status: 'hidden' })
}

export function deleteReview(id) {
  return axiosClient.delete(`/dashboard/platform-reviews/${id}`)
}

export function replyToReview(id, data) {
  return axiosClient.post(`/dashboard/platform-reviews/${id}/reply`, data)
}

export function updateReview(id, data) {
  return axiosClient.put(`/dashboard/platform-reviews/${id}`, data)
}

// ── Facility Reviews ─────────────────────

export function getFacilityReviews(params = {}) {
  return axiosClient.get('/dashboard/facility-reviews', { params })
}

export function showFacilityReview(uuid) {
  return axiosClient.patch(`/dashboard/facility-reviews/${uuid}/show`)
}

export function hideFacilityReview(uuid) {
  return axiosClient.patch(`/dashboard/facility-reviews/${uuid}/hide`)
}
