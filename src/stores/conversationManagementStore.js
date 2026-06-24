import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDashboardStore } from './dashboard'
import * as conversationService from '@/services/conversationManagementService'

export const useConversationManagementStore = defineStore('conversationManagement', () => {
  const dashboardStore = useDashboardStore()

  const conversations = ref([])
  const conversation = ref(null)
  const messages = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const loading = ref(false)
  const messagesLoading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  let _lastParams = {}

  async function fetchConversations(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await conversationService.getConversations(params)
      conversations.value = data.data ?? data
      pagination.value = {
        current_page: data.meta?.current_page ?? data.current_page ?? 1,
        last_page: data.meta?.last_page ?? data.last_page ?? 1,
        per_page: data.meta?.per_page ?? data.per_page ?? 10,
        total: data.meta?.total ?? data.total ?? 0,
        from: data.meta?.from ?? data.from,
        to: data.meta?.to ?? data.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load conversations'
      error.value = msg
      dashboardStore.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  async function fetchConversationStats() {
    try {
      const { data } = await conversationService.getConversationStats()
      stats.value = data.data ?? data
    } catch {
      stats.value = null
    }
  }

  async function fetchConversationDetails(id) {
    messagesLoading.value = true
    error.value = null
    try {
      const { data } = await conversationService.getConversationDetails(id)
      conversation.value = data.data ?? data
      messages.value = data.messages ?? data.data?.messages ?? []
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load conversation details'
      error.value = msg
      dashboardStore.addToast(msg, 'error')
    } finally {
      messagesLoading.value = false
    }
  }

  async function archiveConversation(id) {
    saving.value = true
    try {
      await conversationService.archiveConversation(id)
      dashboardStore.addToast('Conversation archived successfully', 'success')
      await fetchConversations(_lastParams)
      await fetchConversationStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to archive conversation'
      dashboardStore.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function lockConversation(id) {
    saving.value = true
    try {
      await conversationService.lockConversation(id)
      dashboardStore.addToast('Conversation locked successfully', 'success')
      await fetchConversations(_lastParams)
      await fetchConversationStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to lock conversation'
      dashboardStore.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  function resetConversationDetail() {
    conversation.value = null
    messages.value = []
  }

  return {
    conversations, conversation, messages, pagination, stats,
    loading, messagesLoading, saving, error,
    fetchConversations, fetchConversationStats, fetchConversationDetails,
    archiveConversation, lockConversation, resetConversationDetail,
  }
})
