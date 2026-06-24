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

// ── Admin (platform) ──────────────────────

export function getAdminMedicationRequests(params = {}) {
  return axiosClient.get('/dashboard/medication-requests', { params })
}

export function getAdminMedicationRequest(uuid) {
  return axiosClient.get(`/dashboard/medication-requests/${uuid}`)
}

// ── Patient (frontend) ─────────────────────

export function getMedicationRequests(params = {}) {
  return axiosClient.get('/patient/medication-requests', { params })
}

export function getMedicationRequest(uuid) {
  return axiosClient.get(`/patient/medication-requests/${uuid}`)
}

export function cancelMedicationRequest(uuid) {
  return axiosClient.patch(`/patient/medication-requests/${uuid}/cancel`)
}

// ── Facility (dashboard) ───────────────────

export function getFacilityMedicationRequests(params = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/dashboard/facility/${facilityUuid}/medication-requests`, { params })
}

export function acceptMedicationRequest(medicationRequestUuid, data = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.post(`/dashboard/facility/${facilityUuid}/medication-requests/${medicationRequestUuid}/accept`, data)
}

export function rejectMedicationRequest(medicationRequestUuid, data = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.post(`/dashboard/facility/${facilityUuid}/medication-requests/${medicationRequestUuid}/reject`, data)
}
