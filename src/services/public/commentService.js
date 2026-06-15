import axiosClient from '@/axiosClient'

export function getArticleComments(articleId, params = {}) {
  return axiosClient.get(`/articles/${articleId}/comments`, { params })
}

export function createComment(articleId, data) {
  return axiosClient.post(`/articles/${articleId}/comments`, data)
}
