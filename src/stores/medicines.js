import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDashboardStore } from './dashboard'
import * as medicineService from '@/services/medicineService'

export const useMedicinesStore = defineStore('medicine', () => {
  const medicines = ref([])
  const medicine = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const pagination = ref({})
  const errors = ref({})
  const lookupResults = ref([])
  const lookupLoading = ref(false)

  let _lastParams = {}

  async function fetchMedicines(params = {}) {
    loading.value = true
    errors.value = {}
    _lastParams = params
    try {
      const { data } = await medicineService.getMedicines(params)
      console.log(data);
      medicines.value = data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load medicines'
      errors.value = { general: msg }
    } finally {
      loading.value = false
    }
  }

  async function fetchMedicine(uuid) {
    loading.value = true
    medicine.value = null
    errors.value = {}
    try {
      const { data } = await medicineService.getMedicine(uuid)
      medicine.value = data.data
      console.log(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load medicine'
      errors.value = { general: msg }
    } finally {
      loading.value = false
    }
  }

  async function createMedicine(formData) {
    saving.value = true
    errors.value = {}
    try {
      await medicineService.createMedicine(formData)
      const toast = useDashboardStore()
      toast.addToast('Medicine created successfully', 'success')
      return { success: true }
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors || {}
      } else {
        const msg = err.response?.data?.message || 'Failed to create medicine'
        errors.value = { general: msg }
      }
      return { success: false }
    } finally {
      saving.value = false
    }
  }

  async function updateMedicine(uuid, formData) {
    saving.value = true
    errors.value = {}
    try {
      console.log(uuid);
      await medicineService.updateMedicine(uuid, formData)
      const toast = useDashboardStore()
      toast.addToast('Medicine updated successfully', 'success')
      return { success: true }
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors || {}
      } else {
        const msg = err.response?.data?.message || 'Failed to update medicine'
        errors.value = { general: msg }
      }
      return { success: false }
    } finally {
      saving.value = false
    }
  }

  async function deleteMedicine(uuid) {
    try {
      await medicineService.deleteMedicine(uuid)
      const toast = useDashboardStore()
      toast.addToast('Medicine deleted successfully', 'success')
      if (medicines.value.length <= 1 && (pagination.value.current_page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (pagination.value.current_page || 1) - 1 }
      }
      await fetchMedicines(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete medicine'
      errors.value = { general: msg }
      return { success: false }
    }
  }

  async function lookupMedicines(query = '') {
    lookupLoading.value = true
    try {
      const { data } = await medicineService.lookupMedicines({ search: query })
      lookupResults.value = data.data || data
      return lookupResults.value
    } catch (err) {
      lookupResults.value = []
      return []
    } finally {
      lookupLoading.value = false
    }
  }

  return {
    medicines,
    medicine,
    loading,
    saving,
    pagination,
    errors,
    lookupResults,
    lookupLoading,
    fetchMedicines,
    fetchMedicine,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    lookupMedicines,
  }
})
