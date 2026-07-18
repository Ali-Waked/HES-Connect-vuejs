import axiosClient from '@/axiosClient'

export function getArticleComments(articleId, params = {}) {
  return axiosClient.get(`/articles/${articleId}/comments`, { params })
}

export function createComment(articleId, data) {
  return axiosClient.post(`/articles/${articleId}/comment`, data)
}

export function updateComment(articleId, commentId, data) {
  return axiosClient.put(`/articles/${articleId}/comment/${commentId}`, data)
}

export function deleteComment(articleId, commentId) {
  return axiosClient.delete(`/articles/${articleId}/comment/${commentId}`)
}
