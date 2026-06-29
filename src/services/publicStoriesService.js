import axiosClient from '@/axiosClient'

export function getPublicStories(params = {}) {
  return axiosClient.get('/stories', { params })
}

export function getPublicStory(id) {
  return axiosClient.get(`/stories/${id}`)
}
