import axiosClient from '@/axiosClient'

export function getPlatformReviews(params = {}) {
  return axiosClient.get('/platform-review', { params })
}

export function getMyReview() {
  return axiosClient.get('/platform-review/my-review')
}

export function createReview(data) {
  return axiosClient.post('/platform-review', data)
}

export function updateReview(data) {
  return axiosClient.put('/platform-review', data)
}
