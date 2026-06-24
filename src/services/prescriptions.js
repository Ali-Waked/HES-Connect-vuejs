import axiosClient from '@/axiosClient'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'

function getStaffUuid() {
  try {
    const auth = useAuthStore()
    const workspaceStore = useWorkspaceStore()
    return workspaceStore.currentWorkspace?.uuid || auth.user?.uuid
  } catch {
    return null
  }
}

// ── Platform Admin ────────────────────────

export function getAdminPrescriptions(params = {}) {
  return axiosClient.get('/dashboard/prescriptions', { params })
}

export function getAdminPrescription(uuid) {
  return axiosClient.get(`/dashboard/prescriptions/${uuid}`)
}

export function getAdminPrescriptionAnalytics(params = {}) {
  return axiosClient.get('/dashboard/prescriptions/analytics', { params })
}

// ── Facility Owner ────────────────────────

export function getFacilityOwnerPrescriptions(params = {}) {
  return axiosClient.get('/dashboard/facility-owner/prescriptions', { params })
}

export function getFacilityOwnerPrescription(uuid) {
  return axiosClient.get(`/dashboard/facility-owner/prescriptions/${uuid}`)
}

export function getFacilityOwnerPrescriptionAnalytics(params = {}) {
  return axiosClient.get('/dashboard/facility-owner/prescriptions/analytics', { params })
}

// ── Doctor ────────────────────────────────

export function getDoctorPrescriptions(params = {}) {
  const staffUuid = getStaffUuid()
  return axiosClient.get(`/dashboard/${staffUuid}/prescriptions`, { params })
}

export function getDoctorPrescription(uuid) {
  const staffUuid = getStaffUuid()
  return axiosClient.get(`/dashboard/${staffUuid}/prescriptions/${uuid}`)
}

// ── Staff ─────────────────────────────────

export function getStaffPrescriptions(params = {}) {
  const staffUuid = getStaffUuid()
  return axiosClient.get(`/dashboard/${staffUuid}/prescriptions`, { params })
}

export function getStaffPrescription(uuid) {
  const staffUuid = getStaffUuid()
  return axiosClient.get(`/dashboard/${staffUuid}/prescriptions/${uuid}`)
}

export function createStaffPrescription(data) {
  const staffUuid = getStaffUuid()
  return axiosClient.post(`/dashboard/${staffUuid}/prescriptions`, data)
}

// ── Patient ───────────────────────────────

export function getPatientPrescriptions(params = {}) {
  return axiosClient.get('/patient/prescriptions', { params })
}

export function getPatientPrescription(uuid) {
  return axiosClient.get(`/patient/prescriptions/${uuid}`)
}

export function getPrescriptionPharmacies(uuid) {
  return axiosClient.get(`/patient/prescriptions/${uuid}/pharmacies`)
}

export function selectPharmacy(uuid, data = {}) {
  return axiosClient.post(`/patient/prescriptions/${uuid}/select-pharmacy`, data)
}
