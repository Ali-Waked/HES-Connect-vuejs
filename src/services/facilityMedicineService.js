import axiosClient from '@/axiosClient'
import { useWorkspaceStore } from '@/stores/workspace'

function getFacilityUuid() {
  try {
    const store = useWorkspaceStore()
    return store.currentFacility?.uuid
  } catch {
    return null
  }
}

export function getFacilityMedicines(params = {}) {
  const uuid = getFacilityUuid()
  return axiosClient.get(`/dashboard/facility/${uuid}/medicine`, { params })
}

export function getFacilityMedicine(facilityMedicineUuid) {
  const uuid = getFacilityUuid()
  return axiosClient.get(`/dashboard/facility/${uuid}/medicine/${facilityMedicineUuid}`)
}

export function createFacilityMedicine(data) {
  const uuid = getFacilityUuid()
  return axiosClient.post(`/dashboard/facility/${uuid}/medicine`, data)
}

export function updateFacilityMedicine(facilityMedicineUuid, data) {
  const uuid = getFacilityUuid()
  return axiosClient.patch(`/dashboard/facility/${uuid}/medicine/${facilityMedicineUuid}`, data)
}

export function deleteFacilityMedicine(facilityMedicineUuid) {
  const uuid = getFacilityUuid()
  return axiosClient.delete(`/dashboard/facility/${uuid}/medicine/${facilityMedicineUuid}`)
}

export function lookupFacilityMedicines(params = {}) {
  const uuid = getFacilityUuid()
  return axiosClient.get(`/dashboard/facility/${uuid}/medicine/lookup`, { params })
}

export function getFacilityMedicineStats() {
  const uuid = getFacilityUuid()
  return axiosClient.get(`/dashboard/facility/${uuid}/medicine/stats`)
}
