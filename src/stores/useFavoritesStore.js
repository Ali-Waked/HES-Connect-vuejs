import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as favoritesService from '@/services/favoritesService'
import { usePublicToast } from '@/composables/usePublicToast'

export const useFavoritesStore = defineStore('favorites', () => {
  const { t } = useI18n()
  const { addToast } = usePublicToast()

  const favorites = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref(null)
  const page = ref(1)
  const hasMore = ref(true)
  const filter = ref('all')
  const toggling = ref(new Set())

  const favoritedIds = ref({})

  const filteredFavorites = computed(() => {
    if (filter.value === 'all') return favorites.value
    return favorites.value.filter(f => f.type === filter.value)
  })

  function cacheKey(type, id) {
    return `${type}:${id}`
  }

  function isFavorited(type, id) {
    return !!favoritedIds.value[cacheKey(type, id)]
  }

  function setFilter(newFilter) {
    if (filter.value === newFilter) return
    filter.value = newFilter
    favorites.value = []
    page.value = 1
    hasMore.value = true
    error.value = null
    loadFavorites(true)
  }

  async function loadFavorites(reset = false) {
    if (reset) {
      page.value = 1
      hasMore.value = true
    }
    if (loading.value || loadingMore.value) return
    if (!hasMore.value && !reset) return

    const isInitial = page.value === 1

    if (isInitial) {
      loading.value = true
    } else {
      loadingMore.value = true
    }
    error.value = null

    try {
      const params = { page: page.value }
      if (filter.value !== 'all') {
        params.type = filter.value
      }
      const { data } = await favoritesService.getFavorites(params)
      const responseData = data?.data || data || []
      const meta = data?.meta || data?.pagination || {}

      const items = Array.isArray(responseData) ? responseData : []

      if (reset || page.value === 1) {
        favorites.value = items
      } else {
        favorites.value = [...favorites.value, ...items]
      }

      items.forEach(item => {
        if (item.type && item.entity?.id) {
          const key = cacheKey(item.type, item.entity.id)
          const existing = favoritedIds.value[key]
          favoritedIds.value = { ...favoritedIds.value, [key]: existing || item.id }
        }
        if (item.type && item.entity?.uuid) {
          const key = cacheKey(item.type, item.entity.uuid)
          const existing = favoritedIds.value[key]
          favoritedIds.value = { ...favoritedIds.value, [key]: existing || item.id }
        }
        if (item.type && item.id && !item.entity) {
          const key = cacheKey(item.type, item.id)
          const existing = favoritedIds.value[key]
          favoritedIds.value = { ...favoritedIds.value, [key]: existing || item.id }
        }
      })

      const lastPage = meta.last_page || meta.lastPage || data?.last_page || 1
      hasMore.value = page.value < lastPage
      if (items.length === 0) hasMore.value = false
    } catch (err) {
      error.value = err.response?.data?.message || t('favorites.errorGeneric')
      if (reset) favorites.value = []
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  function loadMore() {
    if (!hasMore.value || loadingMore.value || loading.value) return
    page.value++
    loadFavorites()
  }

  async function toggleFavorite(type, entityId) {
    const key = cacheKey(type, entityId)
    if (toggling.value.has(key)) return
    toggling.value = new Set([...toggling.value, key])

    const wasFavorited = isFavorited(type, entityId)
    const favoriteId = favoritedIds.value[key]

    if (wasFavorited) {
      const newIds = { ...favoritedIds.value }
      delete newIds[key]
      favoritedIds.value = newIds
      favorites.value = favorites.value.filter(f => {
        if (f.type === type && f.entity?.id === entityId) return false
        if (f.type === type && f.entity?.uuid === entityId) return false
        if (f.type === type && f.id === entityId) return false
        return true
      })
    } else {
      favoritedIds.value = { ...favoritedIds.value, [key]: `temp-${Date.now()}` }
    }

    try {
      if (wasFavorited && favoriteId && !String(favoriteId).startsWith('temp-') && !String(favoriteId).startsWith('restored-')) {
        await favoritesService.removeFavorite(favoriteId)
      } else {
        await favoritesService.addFavorite({ type, id: entityId })
      }
      if (wasFavorited) {
        addToast(t('favorites.removeSuccess'), 'success')
      } else {
        addToast(t('favorites.addSuccess'), 'success')
      }
    } catch (err) {
      if (wasFavorited) {
        const key2 = cacheKey(type, entityId)
        favoritedIds.value = { ...favoritedIds.value, [key2]: favoriteId || `restored-${Date.now()}` }
      } else {
        const newIds = { ...favoritedIds.value }
        delete newIds[key]
        favoritedIds.value = newIds
      }
      addToast(err.response?.data?.message || t('favorites.errorGeneric'), 'error')
    } finally {
      const next = new Set(toggling.value)
      next.delete(key)
      toggling.value = next
    }
  }

  function isToggling(type, id) {
    return toggling.value.has(cacheKey(type, id))
  }

  async function removeFavoriteById(favoriteId) {
    try {
      await favoritesService.removeFavorite(favoriteId)
      favorites.value = favorites.value.filter(f => f.id !== favoriteId)
      const newIds = { ...favoritedIds.value }
      for (const [k, v] of Object.entries(newIds)) {
        if (v === favoriteId) delete newIds[k]
      }
      favoritedIds.value = newIds
      addToast(t('favorites.removeSuccess'), 'success')
    } catch (err) {
      addToast(err.response?.data?.message || t('favorites.errorGeneric'), 'error')
    }
  }

  return {
    favorites,
    loading,
    loadingMore,
    error,
    page,
    hasMore,
    filter,
    toggling,
    favoritedIds,
    filteredFavorites,
    isFavorited,
    isToggling,
    setFilter,
    loadFavorites,
    loadMore,
    toggleFavorite,
    removeFavoriteById,
  }
})
