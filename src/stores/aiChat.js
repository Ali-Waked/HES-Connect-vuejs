import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import {
  askQuestion,
  getConversations,
  getConversation,
  renameConversation,
  deleteConversation,
} from '@/services/aiChatService'

export const useAiChatStore = defineStore('aiChat', () => {
  const conversations = ref([])
  const conversationsMeta = ref({ current_page: 1, last_page: 1, total: 0 })
  const activeConversation = ref(null)
  const messages = ref([])
  const loading = ref(false)
  const loadingConversations = ref(false)
  const error = ref(null)

  const role = computed(() => {
    const auth = useAuthStore()
    if (auth.systemPermissions?.length > 0) return 'super_admin'
    return 'facility_owner'
  })

  const assistantLabel = computed(() => {
    return role.value === 'super_admin'
      ? 'Platform AI Assistant'
      : 'Facility AI Assistant'
  })

  async function fetchConversations(page = 1) {
    loadingConversations.value = true
    try {
      const { data } = await getConversations({ page })
      conversations.value = data.data
      conversationsMeta.value = data.meta
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load conversations.'
    } finally {
      loadingConversations.value = false
    }
  }

  async function loadConversation(uuid) {
    loading.value = true
    error.value = null
    try {
      const { data } = await getConversation(uuid)
      activeConversation.value = data.data.conversation
      messages.value = data.data.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        toolName: m.tool_name,
        toolArguments: m.tool_arguments,
        toolResult: m.tool_result,
        timestamp: m.created_at,
      }))
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load conversation.'
    } finally {
      loading.value = false
    }
  }

  function startNewConversation() {
    activeConversation.value = null
    messages.value = []
    error.value = null
  }

  async function sendMessage(text) {
    if (!text?.trim() || loading.value) return

    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
    messages.value.push(userMsg)

    loading.value = true
    error.value = null

    try {
      const payload = { message: text.trim() }
      if (activeConversation.value?.uuid) {
        payload.conversation_uuid = activeConversation.value.uuid
      }

      const { data } = await askQuestion(payload)

      if (!activeConversation.value && data.conversation) {
        activeConversation.value = data.conversation
        await fetchConversations()
      }

      if (data.assistant?.tools_used) {
        for (const tool of data.assistant.tools_used) {
          messages.value.push({
            role: 'tool',
            content: JSON.stringify(tool.arguments),
            toolName: tool.tool,
            toolArguments: tool.arguments,
            toolResult: null,
            timestamp: new Date().toISOString(),
          })
        }
      }

      if (data.assistant?.message) {
        messages.value.push({
          role: 'assistant',
          content: data.assistant.message,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to get response. Please try again.'
      error.value = errMsg
      messages.value.push({
        role: 'assistant',
        content: errMsg,
        isError: true,
        timestamp: new Date().toISOString(),
      })
    } finally {
      loading.value = false
    }
  }

  async function renameConv(uuid, title) {
    try {
      const { data } = await renameConversation(uuid, { title })
      const idx = conversations.value.findIndex((c) => c.uuid === uuid)
      if (idx !== -1) {
        conversations.value[idx] = data.data
      }
      if (activeConversation.value?.uuid === uuid) {
        activeConversation.value = data.data
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to rename conversation.'
    }
  }

  async function deleteConv(uuid) {
    try {
      await deleteConversation(uuid)
      conversations.value = conversations.value.filter((c) => c.uuid !== uuid)
      if (activeConversation.value?.uuid === uuid) {
        startNewConversation()
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to delete conversation.'
    }
  }

  return {
    conversations,
    conversationsMeta,
    activeConversation,
    messages,
    loading,
    loadingConversations,
    error,
    role,
    assistantLabel,
    fetchConversations,
    loadConversation,
    startNewConversation,
    sendMessage,
    renameConv,
    deleteConv,
  }
})
