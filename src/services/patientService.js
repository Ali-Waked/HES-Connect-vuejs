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

function facilityPath(base = '') {
  const uuid = getFacilityUuid()
  if (!uuid) return base || '/dashboard/patients'
  return `/dashboard/facility/${uuid}/patients${base}`
}

export function getPatients(params = {}) {
  return axiosClient.get(facilityPath(), { params })
}

export function getPatient(uuid) {
  return axiosClient.get(`/dashboard/patients/${uuid}`)
}

export function deletePatient(id) {
  return axiosClient.delete(`/dashboard/patients/${id}`)
}
