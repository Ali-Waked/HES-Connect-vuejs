import axiosClient from '@/axiosClient'

export function getFacilityReviews(facilityUuid, params = {}) {
  return axiosClient.get(`/facilities/${facilityUuid}/reviews`, { params })
}

export function submitFacilityReview(facilityUuid, data) {
  return axiosClient.post(`/facilities/${facilityUuid}/reviews`, data)
}
