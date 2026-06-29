import { ref, reactive } from 'vue'
import { getMyStories, createMyStory, updateMyStory, deleteMyStory } from '@/services/patientStoriesService'

export function usePatientStories() {
  const stories = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const statusFilter = ref('')
  const fundraisingOnly = ref(false)
  const categoryFilter = ref('')
  const pagination = reactive({
    current_page: 1,
    last_page: 1,
    total: 0,
  })

  async function fetchStories() {
    loading.value = true
    error.value = ''
    try {
      const params = { page: pagination.current_page, per_page: 10 }
      if (statusFilter.value) params.status = statusFilter.value
      if (fundraisingOnly.value) params.is_fundraising = true
      if (categoryFilter.value) params.category_id = categoryFilter.value
      const { data } = await getMyStories(params)
      if (data.data) {
        stories.value = data.data
        if (data.meta) {
          pagination.current_page = data.meta.current_page || 1
          pagination.last_page = data.meta.last_page || 1
          pagination.total = data.meta.total || 0
        }
      } else if (Array.isArray(data)) {
        stories.value = data
      } else {
        stories.value = []
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load stories'
      error.value = msg
    } finally {
      loading.value = false
    }
  }

  async function saveStory(formData, existingId = null) {
    saving.value = true
    error.value = ''
    try {
      if (existingId) {
        await updateMyStory(existingId, formData)
      } else {
        await createMyStory(formData)
      }
      await fetchStories()
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save story'
      error.value = msg
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeStory(id) {
    try {
      await deleteMyStory(id)
      await fetchStories()
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete story'
      error.value = msg
      return false
    }
  }

  function setPage(page) {
    pagination.current_page = page
    fetchStories()
  }

  function setStatusFilter(status) {
    statusFilter.value = status
    pagination.current_page = 1
    fetchStories()
  }

  function toggleFundraisingOnly(val) {
    fundraisingOnly.value = val
    pagination.current_page = 1
    fetchStories()
  }

  return {
    stories,
    loading,
    saving,
    error,
    statusFilter,
    fundraisingOnly,
    pagination,
    fetchStories,
    saveStory,
    removeStory,
    setPage,
    setStatusFilter,
    toggleFundraisingOnly,
  }
}
