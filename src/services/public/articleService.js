import axiosClient from '@/axiosClient'

export function getArticles(params = {}) {
  return axiosClient.get('/articles', { params })
}

export function getArticleDetail(uuid) {
  return axiosClient.get(`/articles/${uuid}`)
}

export function getFeaturedArticles(limit = 5) {
  return axiosClient.get('/articles/featured', { params: { limit } })
}

export function getPopularArticles(limit = 5) {
  return axiosClient.get('/articles/popular', { params: { limit } })
}

export function getCategoriesPublic() {
  return axiosClient.get('/categories')
}

export function getTagsPublic() {
  return axiosClient.get('/tags')
}
