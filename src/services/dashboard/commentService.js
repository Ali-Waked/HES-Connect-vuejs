import axiosClient from '@/axiosClient'

export function getArticleComments(articleId, params = {}) {
  return axiosClient.get(`/dashboard/articles/${articleId}/comments`, { params })
}

export function createComment(articleId, data) {
  return axiosClient.post(`/dashboard/articles/${articleId}/comments`, data)
}

export function updateComment(articleId, commentId, data) {
  return axiosClient.put(`/dashboard/articles/${articleId}/comments/${commentId}`, data)
}

export function deleteComment(articleId, commentId) {
  return axiosClient.delete(`/dashboard/articles/${articleId}/comments/${commentId}`)
}

export function updateCommentStatus(articleId, commentId, status) {
  return axiosClient.put(`/dashboard/articles/${articleId}/comments/${commentId}`, { status })
}
