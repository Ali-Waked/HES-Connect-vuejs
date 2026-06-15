import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as contactMessageService from '@/services/contactMessageService'

export function useContactMessages() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const messages = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchMessages(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await contactMessageService.getMessages(params)
      messages.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load messages'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => {
    fetchMessages(_lastParams)
    fetchMessageStats()
  })

  async function fetchMessageStats() {
    statsLoading.value = true
    try {
      const { data } = await contactMessageService.getMessages({ per_page: 1, page: 1 })
      const total = data.meta?.total || 0
      const all = data.data || []
      const newCount = all.filter(m => m.status === 'new').length
      const readCount = all.filter(m => m.status === 'read').length
      const repliedCount = all.filter(m => m.status === 'replied').length
      stats.value = { total, new: newCount, read: readCount, replied: repliedCount }
    } catch {
      stats.value = null
    } finally {
      statsLoading.value = false
    }
  }

  async function updateMessageStatus(id, status) {
    saving.value = true
    try {
      await contactMessageService.updateMessageStatus(id, status)
      store.addToast('Message status updated', 'success')
      await fetchMessages(_lastParams)
      await fetchMessageStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  return {
    messages,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    fetchMessages,
    fetchMessageStats,
    updateMessageStatus,
  }
}
