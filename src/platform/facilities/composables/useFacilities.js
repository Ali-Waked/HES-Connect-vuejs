import { ref } from 'vue'
import { useFacilitiesStore } from '../stores/facilities'
import { getValidationErrors } from '@/shared/http/errorHandler'

export function useFacilities() {
  const store = useFacilitiesStore()
  const validationErrors = ref({})

  async function loadItems(params = {}) {
    validationErrors.value = {}
    return store.fetchItems(params)
  }

  async function loadStats() {
    return store.fetchStats()
  }

  async function loadItem(id) {
    validationErrors.value = {}
    return store.fetchItem(id)
  }

  async function saveItem(data, id = null) {
    validationErrors.value = {}
    try {
      if (id) {
        return await store.updateItem(id, data)
      }
      return await store.createItem(data)
    } catch (err) {
      if (err.status === 422) {
        validationErrors.value = getValidationErrors(err)
      }
      throw err
    }
  }

  async function deleteItem(id) {
    return store.removeItem(id)
  }

  return {
    ...store,
    validationErrors,
    loadItems,
    loadStats,
    loadItem,
    saveItem,
    deleteItem,
  }
}
