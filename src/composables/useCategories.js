import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as categoryService from '@/services/categoryService'

export function useCategories() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const categories = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchCategories(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await categoryService.getCategories(params)
      categories.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load categories'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => {
    fetchCategories(_lastParams)
    fetchCategoryStats()
  })

  async function fetchCategoryStats() {
    statsLoading.value = true
    try {
      const { data } = await categoryService.getCategoryStats()
      stats.value = data
    } catch (err) {
      // silently fail for stats
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchCategory(uuid) {
    const { data } = await categoryService.getCategory(uuid)
    return data.data
  }

  async function createCategory(formData) {
    saving.value = true
    try {
      await categoryService.createCategory(formData)
      store.addToast(t('categoryManagement.created') || 'Category created successfully', 'success')
      await fetchCategories(_lastParams)
      await fetchCategoryStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create category'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateCategory(uuid, formData) {
    saving.value = true
    try {
      await categoryService.updateCategory(uuid, formData)
      store.addToast(t('categoryManagement.updated') || 'Category updated successfully', 'success')
      await fetchCategories(_lastParams)
      await fetchCategoryStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update category'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteCategory(uuid) {
    try {
      await categoryService.deleteCategory(uuid)
      store.addToast('Category deleted successfully', 'success')
      if (categories.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchCategories(_lastParams)
      await fetchCategoryStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete category'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    categories,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    fetchCategories,
    fetchCategoryStats,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
