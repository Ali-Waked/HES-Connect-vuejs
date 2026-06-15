import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from './useLocaleField'
import * as articleService from '@/services/public/articleService'

export function useArticleDetail(uuid) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const { localField } = useLocaleField()

  const article = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const notFound = ref(false)

  const sidebarLoading = ref(true)
  const popularArticles = ref([])
  const latestArticles = ref([])
  const categories = ref([])

  const title = computed(() => localField(article.value, 'title'))
  const content = computed(() => localField(article.value, 'content'))
  const excerpt = computed(() => localField(article.value, 'excerpt'))

  const categoryName = computed(() => {
    const cat = article.value?.category
    if (!cat) return ''
    return localField(cat, 'name') || cat.name || ''
  })

  const authorName = computed(() => article.value?.author?.name || article.value?.author_name || '')
  const hasGallery = computed(() => (article.value?.images?.length || 0) > 0)
  const galleryImages = computed(() => article.value?.images || [])
  const currentGalleryIndex = ref(0)

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  let origTitle = ''
  const origMeta = []
  const origLinks = []

  function setMeta(name, content) {
    const key = name.startsWith('og:') || name.startsWith('article:') || name.startsWith('twitter:') ? 'property' : 'name'
    const selector = `meta[${key}="${name}"]`
    let el = document.querySelector(selector)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(key, name)
      document.head.appendChild(el)
    }
    origMeta.push({ el, content: el.getAttribute('content') || '' })
    el.setAttribute('content', content)
  }

  function setCanonical(href) {
    let el = document.querySelector('link[rel="canonical"]')
    if (!el) {
      el = document.createElement('link')
      el.setAttribute('rel', 'canonical')
      document.head.appendChild(el)
    }
    origLinks.push({ el, href: el.getAttribute('href') || '' })
    el.setAttribute('href', href)
  }

  function restoreMeta() {
    document.title = origTitle
    origMeta.forEach(({ el, content }) => {
      if (content) el.setAttribute('content', content)
      else el.remove()
    })
    origLinks.forEach(({ el, href }) => {
      if (href) el.setAttribute('href', href)
      else el.remove()
    })
  }

  async function fetchArticle() {
    loading.value = true
    error.value = null
    notFound.value = false
    try {
      const { data } = await articleService.getArticleDetail(uuid)
      const articleData = data?.data || data
      if (!articleData) {
        notFound.value = true
        return
      }
      article.value = articleData
      origTitle = document.title
      document.title = `${title.value} - HES Connect`
      const desc = excerpt.value || title.value
      setMeta('description', desc)
      setMeta('og:title', title.value)
      setMeta('og:description', desc)
      setMeta('og:type', 'article')
      setMeta('og:url', window.location.href)
      setMeta('twitter:card', 'summary_large_image')
      setMeta('twitter:title', title.value)
      setMeta('twitter:description', desc)
      if (articleData.cover_image) {
        setMeta('og:image', articleData.cover_image)
        setMeta('twitter:image', articleData.cover_image)
      }
      if (articleData.published_at) setMeta('article:published_time', articleData.published_at)
      if (articleData.author?.name) setMeta('article:author', articleData.author.name)
      if (articleData.category?.name?.en) setMeta('article:section', articleData.category.name.en)
      setCanonical(window.location.href)
    } catch (err) {
      if (err.response?.status === 404) notFound.value = true
      else error.value = err.response?.data?.message || 'Failed to load article'
    } finally {
      loading.value = false
    }
  }

  async function fetchSidebar() {
    sidebarLoading.value = true
    try {
      const [popularRes, latestRes, catsRes] = await Promise.all([
        articleService.getPopularArticles(5),
        articleService.getArticles({ sort: 'latest', per_page: 5 }),
        articleService.getCategoriesPublic(),
      ])
      popularArticles.value = popularRes?.data?.data || popularRes?.data || []
      const latestData = latestRes?.data?.data || latestRes?.data || []
      latestArticles.value = Array.isArray(latestData) ? latestData.slice(0, 5) : []
      categories.value = catsRes?.data?.data || catsRes?.data || []
    } catch {
      // silent
    } finally {
      sidebarLoading.value = false
    }
  }

  function goToTag(slug) {
    router.push({ path: '/articles', query: { tag: slug } })
  }

  function goToCategory(slug) {
    router.push({ path: '/articles', query: { category: slug } })
  }

  function goToArticle(id) {
    router.push(`/articles/${id}`)
  }

  onMounted(async () => {
    await fetchArticle()
    await fetchSidebar()
  })

  onUnmounted(restoreMeta)

  return {
    article,
    loading,
    error,
    notFound,
    sidebarLoading,
    popularArticles,
    latestArticles,
    categories,
    title,
    content,
    excerpt,
    categoryName,
    authorName,
    hasGallery,
    galleryImages,
    currentGalleryIndex,
    formatDate,
    goToTag,
    goToCategory,
    goToArticle,
  }
}
