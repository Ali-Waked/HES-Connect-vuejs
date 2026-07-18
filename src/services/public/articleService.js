import axiosClient from '@/axiosClient'

export function getArticles(params = {}) {
  return axiosClient.get('/articles', { params })
}

export function getArticleDetail(uuid) {
  return axiosClient.get(`/articles/${uuid}`)
}
