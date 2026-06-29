import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sendConsultationMessage } from '@/services/patientAiService'

export const usePatientAiStore = defineStore('patientAi', () => {
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)
  const recommendations = ref(null)

  const hasRecommendations = computed(() => recommendations.value !== null)

  function addMessage(msg) {
    messages.value.push(msg)
  }

  async function sendMessage(text) {
    if (!text?.trim() || loading.value) return

    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
    addMessage(userMsg)

    loading.value = true
    error.value = null
    recommendations.value = null

    try {
      const { data } = await sendConsultationMessage({ message: text.trim() })
      const result = data.data || data
      const aiResponse = result.response || result.message || ''
      const followUps = result.follow_up_questions || []

      const aiMsg = {
        role: 'assistant',
        content: aiResponse,
        followUpQuestions: followUps,
        timestamp: new Date().toISOString(),
      }
      addMessage(aiMsg)

      recommendations.value = {
        condition: result.condition || null,
        urgency: result.urgency || null,
        doctors: result.doctors || [],
        followUpQuestions: followUps,
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Unable to analyze your symptoms right now. Please try again.'
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

  function clearChat() {
    messages.value = []
    recommendations.value = null
    error.value = null
  }

  return {
    messages,
    loading,
    error,
    recommendations,
    hasRecommendations,
    sendMessage,
    clearChat,
  }
})
