import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAiConversations,
  createAiConversation,
  getAiConversation,
  sendAiMessage,
  deleteAiConversation,
  renameAiConversation,
  recommendDoctor,
} from '@/services/patientAiService'

export const usePatientAiStore = defineStore('patientAi', () => {
  const conversations = ref([])
  const activeConversationUuid = ref(null)
  const messages = ref([])
  const loading = ref(false)
  const sending = ref(false)
  const conversationsLoading = ref(false)
  const error = ref(null)
  const requiresNewConversation = ref(false)

  // Triage state
  const triageData = ref(null)
  const recommendedDoctors = ref([])
  const loadingDoctors = ref(false)
  const doctorRecommendationError = ref(null)
  const showDoctorRecommendation = ref(false)

  // Pagination
  const olderPage = ref(1)
  const hasMoreOlder = ref(false)
  const loadingOlder = ref(false)
  const totalMessages = ref(0)

  const activeConversation = computed(() =>
    conversations.value.find(c => c.uuid === activeConversationUuid.value) || null
  )

  const canRequestRecommendation = computed(() => {
    if (!activeConversation.value) return false
    const msgCount = activeConversation.value.message_count || messages.value.length
    return msgCount >= 4 && activeConversation.value.triage_status !== 'recommended'
  })

  const patientSummary = computed(() => {
    const conv = activeConversation.value
    if (!conv) return null

    return {
      symptoms: conv.extracted_symptoms || [],
      urgency: conv.urgency || null,
      specialty: conv.estimated_specialty || null,
      confidence: conv.confidence || null,
      triageStatus: conv.triage_status || 'collecting',
    }
  })

  async function fetchConversations() {
    conversationsLoading.value = true
    error.value = null
    try {
      const { data } = await getAiConversations()
      conversations.value = data.data || []
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load consultations'
    } finally {
      conversationsLoading.value = false
    }
  }

  async function createConversation() {
    try {
      const { data } = await createAiConversation()
      const conv = data.data || data
      conversations.value.unshift(conv)
      activeConversationUuid.value = conv.uuid
      messages.value = []
      triageData.value = null
      recommendedDoctors.value = []
      showDoctorRecommendation.value = false
      olderPage.value = 1
      hasMoreOlder.value = false
      return conv
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to create consultation'
      return null
    }
  }

  async function selectConversation(uuid) {
    if (activeConversationUuid.value === uuid) return
    activeConversationUuid.value = uuid
    messages.value = []
    triageData.value = null
    recommendedDoctors.value = []
    showDoctorRecommendation.value = false
    loading.value = true
    error.value = null
    olderPage.value = 1
    hasMoreOlder.value = false

    try {
      const { data } = await getAiConversation(uuid)
      const convData = data.data || data
      const rawMessages = convData.messages?.data || convData.messages || []

      messages.value = rawMessages.map(normalizeMessage)

      totalMessages.value = convData.messages?.meta?.total || rawMessages.length
      hasMoreOlder.value = rawMessages.length >= 15
      if (hasMoreOlder.value) olderPage.value = 2

      // Update conversation in list with fresh data
      const conv = conversations.value.find(c => c.uuid === uuid)
      if (conv) {
        Object.assign(conv, convData.conversation || convData)
        conv.message_count = conv.message_count || rawMessages.length
      }

      // Restore triage data from conversation
      if (convData.conversation?.triage_status === 'recommended') {
        triageData.value = {
          specialty: convData.conversation.estimated_specialty,
          urgency: convData.conversation.urgency,
          confidence: convData.conversation.confidence,
          symptoms: convData.conversation.extracted_symptoms || [],
        }
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load messages'
    } finally {
      loading.value = false
    }
  }

  async function loadOlderMessages() {
    if (!activeConversationUuid.value || loadingOlder.value || !hasMoreOlder.value) return null
    loadingOlder.value = true
    try {
      const { data } = await getAiConversation(activeConversationUuid.value, { page: olderPage.value })
      const convData = data.data || data
      const rawMessages = convData.messages?.data || convData.messages || []
      const older = rawMessages.map(normalizeMessage)

      if (older.length === 0) {
        hasMoreOlder.value = false
      } else {
        messages.value = [...older, ...messages.value]
        olderPage.value++
        if (older.length < 15) hasMoreOlder.value = false
      }
      return older
    } catch {
      hasMoreOlder.value = false
      return null
    } finally {
      loadingOlder.value = false
    }
  }

  async function sendMessage(text) {
    if (!text?.trim() || sending.value || !activeConversationUuid.value) return null

    const userMsg = {
      uuid: 'temp-' + Date.now(),
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    }
    messages.value.push(userMsg)

    sending.value = true
    error.value = null
    requiresNewConversation.value = false

    try {
      const { data } = await sendAiMessage(activeConversationUuid.value, { message: text.trim() })

      if (data.requires_new_conversation) {
        requiresNewConversation.value = true
        messages.value.pop()
        return null
      }

      const result = data.data || data
      const userMessage = result.user_message
      const assistantMessage = result.assistant_message
      const conversation = result.conversation

      if (userMessage) {
        const tempIdx = messages.value.findIndex(m => m.uuid === userMsg.uuid)
        if (tempIdx !== -1) {
          messages.value[tempIdx] = normalizeMessage(userMessage)
        }
      }

      let aiMsg = null
      if (assistantMessage) {
        aiMsg = normalizeMessage(assistantMessage)
        messages.value.push(aiMsg)
      }

      // Update conversation in list
      if (conversation) {
        const conv = conversations.value.find(c => c.uuid === activeConversationUuid.value)
        if (conv) {
          conv.title = conversation.title || conv.title
          conv.message_count = conversation.message_count || conv.message_count
          conv.total_tokens = conversation.total_tokens || conv.total_tokens
          conv.last_activity_at = conversation.last_activity_at
          conv.last_message_preview = conversation.last_message_preview
          conv.updated_at = conversation.updated_at
          conv.extracted_symptoms = conversation.extracted_symptoms || conv.extracted_symptoms
          conv.estimated_specialty = conversation.estimated_specialty || conv.estimated_specialty
          conv.urgency = conversation.urgency || conv.urgency
          conv.confidence = conversation.confidence || conv.confidence
          conv.triage_status = conversation.triage_status || conv.triage_status
        }
      }

      // Update triage data from conversation response
      if (conversation) {
        triageData.value = {
          specialty: conversation.estimated_specialty || triageData.value?.specialty,
          urgency: conversation.urgency || triageData.value?.urgency,
          confidence: conversation.confidence || triageData.value?.confidence,
          symptoms: conversation.extracted_symptoms || triageData.value?.symptoms || [],
        }
      }

      return aiMsg
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Unable to analyze your symptoms right now. Please try again.'
      error.value = errMsg
      messages.value.push({
        uuid: 'error-' + Date.now(),
        role: 'assistant',
        content: errMsg,
        isError: true,
        created_at: new Date().toISOString(),
      })
      return null
    } finally {
      sending.value = false
    }
  }

  async function requestDoctorRecommendation() {
    if (!activeConversationUuid.value || loadingDoctors.value) return

    loadingDoctors.value = true
    doctorRecommendationError.value = null
    recommendedDoctors.value = []

    try {
      const { data } = await recommendDoctor(activeConversationUuid.value)
      const result = data.data || data

      triageData.value = result.triage || triageData.value
      recommendedDoctors.value = result.doctors || []
      showDoctorRecommendation.value = true

      // Update conversation in list
      const conv = conversations.value.find(c => c.uuid === activeConversationUuid.value)
      if (conv) {
        conv.triage_status = 'recommended'
        conv.estimated_specialty = result.triage?.specialty || conv.estimated_specialty
        conv.urgency = result.triage?.urgency || conv.urgency
        conv.extracted_symptoms = result.triage?.symptoms || conv.extracted_symptoms
      }
    } catch (e) {
      doctorRecommendationError.value = e.response?.data?.message || 'Failed to get doctor recommendations'
    } finally {
      loadingDoctors.value = false
    }
  }

  async function deleteConversation(uuid) {
    try {
      await deleteAiConversation(uuid)
      conversations.value = conversations.value.filter(c => c.uuid !== uuid)
      if (activeConversationUuid.value === uuid) {
        activeConversationUuid.value = null
        messages.value = []
        triageData.value = null
        recommendedDoctors.value = []
        showDoctorRecommendation.value = false
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to delete consultation'
    }
  }

  async function renameConversation(uuid, title) {
    try {
      const { data } = await renameAiConversation(uuid, { title })
      const updated = data.data || data
      const conv = conversations.value.find(c => c.uuid === uuid)
      if (conv) conv.title = updated.title || title
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to rename consultation'
    }
  }

  function clearActiveConversation() {
    activeConversationUuid.value = null
    messages.value = []
    triageData.value = null
    recommendedDoctors.value = []
    showDoctorRecommendation.value = false
    error.value = null
    requiresNewConversation.value = false
  }

  function normalizeMessage(m) {
    const raw = m.content || ''
    let content = raw

    // Check if the message has metadata with analysis
    const meta = m.metadata

    return {
      uuid: m.uuid,
      role: m.role,
      content: content,
      urgency: meta?.urgency || null,
      followUpQuestions: meta?.follow_up_questions || [],
      symptoms: meta?.symptoms || [],
      readyForRecommendation: meta?.ready_for_recommendation || false,
      metadata: meta || null,
      prompt_tokens: m.prompt_tokens || 0,
      completion_tokens: m.completion_tokens || 0,
      total_tokens: m.total_tokens || 0,
      created_at: m.created_at,
      isError: false,
    }
  }

  return {
    conversations,
    activeConversationUuid,
    activeConversation,
    messages,
    loading,
    sending,
    conversationsLoading,
    error,
    requiresNewConversation,
    triageData,
    recommendedDoctors,
    loadingDoctors,
    doctorRecommendationError,
    showDoctorRecommendation,
    hasMoreOlder,
    loadingOlder,
    totalMessages,
    canRequestRecommendation,
    patientSummary,
    fetchConversations,
    createConversation,
    selectConversation,
    loadOlderMessages,
    sendMessage,
    requestDoctorRecommendation,
    deleteConversation,
    renameConversation,
    clearActiveConversation,
  }
})
