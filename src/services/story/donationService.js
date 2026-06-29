import axiosClient from '@/axiosClient'

export function getStoryDonations(storyId, params = {}) {
  return axiosClient.get(`/story/donations/${storyId}`, { params })
}

export function getStoryDonationStats(storyId) {
  return axiosClient.get(`/story/donations/${storyId}/stats`)
}

export function getStoryDonationAnalytics(storyId) {
  return axiosClient.get(`/story/donations/${storyId}/analytics`)
}
