import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { sendChatMessage } from '@/services/aiChatService'

export const useAiChatStore = defineStore('aiChat', () => {
  const messages = ref([])
  const loading = ref(false)
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

  function addMessage(msg) {
    messages.value.push(msg)
  }

  async function sendMessage(text) {
    if (!text?.trim() || loading.value) return

    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
    addMessage(userMsg)

    loading.value = true
    error.value = null

    try {
      const { data } = await sendChatMessage({
        message: text.trim(),
        role: role.value,
      })
      const aiMsg = {
        role: 'assistant',
        content: data.data?.response || data.response || data.message || '',
        timestamp: new Date().toISOString(),
      }
      addMessage(aiMsg)
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to get response. Please try again.'
      error.value = errMsg
      addMessage({
        role: 'assistant',
        content: errMsg,
        isError: true,
        timestamp: new Date().toISOString(),
      })
    } finally {
      loading.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    error.value = null
  }

  return {
    messages,
    loading,
    error,
    role,
    assistantLabel,
    sendMessage,
    clearMessages,
  }
})
