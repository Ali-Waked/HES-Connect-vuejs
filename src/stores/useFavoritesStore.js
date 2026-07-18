import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as favoritesService from '@/services/favoritesService'
import { usePublicToast } from '@/composables/usePublicToast'

const TYPE_MAP = {
  'App\\Models\\Facility': 'facility',
  'App\\Models\\Article': 'article',
  'App\\Models\\Story': 'story',
  'App\\Models\\Staff': 'staff',
  'App\\Models\\Doctor': 'staff',
  'App\\Models\\JobPost': 'job',
}

function normalizeType(rawType) {
  if (!rawType) return 'unknown'
  return TYPE_MAP[rawType] || rawType.toLowerCase().replace(/^app\\models\\/, '').replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
}

export const useFavoritesStore = defineStore('favorites', () => {
  const { t } = useI18n()
  const { addToast } = usePublicToast()

  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)
  const filter = ref('all')
  const toggling = ref(new Set())
  const favoritedIds = ref({})

  const filteredFavorites = computed(() => {
    if (filter.value === 'all') return favorites.value
    return favorites.value.filter(f => f.normalizedType === filter.value)
  })

  function cacheKey(type, id) {
    return `${type}:${id}`
  }

  function isFavorited(type, id) {
    return !!favoritedIds.value[cacheKey(type, id)]
  }

  function isToggling(type, id) {
    return toggling.value.has(cacheKey(type, id))
  }

  function setFilter(newFilter) {
    if (filter.value === newFilter) return
    filter.value = newFilter
  }

  async function loadFavorites() {
    loading.value = true
    error.value = null
    try {
      const params = { page: 1, per_page: 20 }
      if (filter.value !== 'all') params.type = filter.value
      const { data } = await favoritesService.getFavorites(params)
      const items = (data.data || []).map(normalizeItem)
      favorites.value = items
      currentPage.value = data.meta?.current_page || 1
      lastPage.value = data.meta?.last_page || 1
      total.value = data.meta?.total || 0

      items.forEach(item => {
        if (item.normalizedType && item.entityId) {
          const key = cacheKey(item.normalizedType, item.entityId)
          favoritedIds.value = { ...favoritedIds.value, [key]: item.id }
        }
      })
    } catch (err) {
      error.value = err.response?.data?.message || t('favorites.errorGeneric')
      favorites.value = []
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loading.value || currentPage.value >= lastPage.value) return
    loading.value = true
    try {
      const nextPage = currentPage.value + 1
      const params = { page: nextPage, per_page: 20 }
      if (filter.value !== 'all') params.type = filter.value
      const { data } = await favoritesService.getFavorites(params)
      const items = (data.data || []).map(normalizeItem)
      favorites.value = [...favorites.value, ...items]
      currentPage.value = data.meta?.current_page || nextPage
      lastPage.value = data.meta?.last_page || 1
      total.value = data.meta?.total || total.value

      items.forEach(item => {
        if (item.normalizedType && item.entityId) {
          const key = cacheKey(item.normalizedType, item.entityId)
          if (!favoritedIds.value[key]) {
            favoritedIds.value = { ...favoritedIds.value, [key]: item.id }
          }
        }
      })
    } catch {
      // silently fail for load more
    } finally {
      loading.value = false
    }
  }

  function normalizeItem(raw) {
    const rawType = raw.type || ''
    const normalizedType = normalizeType(rawType)
    const itemData = raw.item || raw.entity || raw
    return {
      id: raw.id,
      favoriteId: raw.id,
      rawType,
      normalizedType,
      entity: itemData,
      entityId: itemData?.uuid || itemData?.id,
      created_at: raw.created_at,
    }
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
        if (f.normalizedType === type && f.entityId === entityId) return false
        return true
      })
    } else {
      favoritedIds.value = { ...favoritedIds.value, [key]: `temp-${Date.now()}` }
    }

    try {
      if (wasFavorited && favoriteId && !String(favoriteId).startsWith('temp-')) {
        await favoritesService.removeFavorite(favoriteId)
      } else {
        const { data } = await favoritesService.addFavorite({ type, id: entityId })
        const resp = data?.data || data
        const realId = resp?.id || resp?.favorite?.id
        if (realId) {
          favoritedIds.value = { ...favoritedIds.value, [key]: realId }
        }
      }
      addToast(
        wasFavorited
          ? (t('favorites.removeSuccess') || 'Removed from favorites.')
          : (t('favorites.addSuccess') || 'Added to favorites.'),
        'success'
      )
    } catch (err) {
      if (wasFavorited) {
        favoritedIds.value = { ...favoritedIds.value, [key]: favoriteId || `restored-${Date.now()}` }
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

  return {
    favorites,
    loading,
    error,
    total,
    lastPage,
    filter,
    filteredFavorites,
    isFavorited,
    isToggling,
    setFilter,
    loadFavorites,
    loadMore,
    toggleFavorite,
  }
})
