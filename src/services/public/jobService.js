import axiosClient from '@/axiosClient'

export function getJobs(params = {}) {
  return axiosClient.get('/job-posts', { params })
}

export function getJobDetail(slug) {
  return axiosClient.get(`/job-posts/${slug}`)
}

export function getFeaturedJobs(limit = 4) {
  return axiosClient.get('/job-posts/featured', { params: { limit } })
}
