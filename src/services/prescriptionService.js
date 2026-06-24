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

// ── Platform Admin ────────────────────────

export function getPrescriptions(params = {}) {
  return axiosClient.get('/admin/prescriptions', { params })
}

export function getPrescription(uuid) {
  return axiosClient.get(`/admin/prescriptions/${uuid}`)
}

export function getPrescriptionAnalytics(params = {}) {
  return axiosClient.get('/admin/prescriptions/analytics', { params })
}

// ── Facility Dashboard ────────────────────

export function getFacilityPrescriptions(params = {}) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.get(`/dashboard/facility/${facilityUuid}/prescriptions`, { params })
}

export function getFacilityOwnerPrescriptionAnalytics(params = {}) {
  return axiosClient.get('/dashboard/facility-owner/prescriptions/analytics', { params })
}

// ── Create ────────────────────────────────

export function createPrescription(data) {
  const facilityUuid = getFacilityUuid()
  return axiosClient.post(`/dashboard/facility/${facilityUuid}/prescriptions`, data)
}
