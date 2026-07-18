import axiosClient from '@/axiosClient'

export function getPublicPlatformReviews(params = {}) {
  return axiosClient.get('/public/platform-reviews', { params })
}

export function getMyReview() {
  return axiosClient.get('/platform-review')
}

export function createReview(data) {
  return axiosClient.post('/platform-review', data)
}

export function updateReview(data) {
  return axiosClient.put('/platform-review', data)
}

export function deleteReview() {
  return axiosClient.delete('/platform-review')
}
