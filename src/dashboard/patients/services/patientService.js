import httpClient from '@/shared/http/httpClient'
import { createCrudService } from '@/shared/http/serviceFactory'

const basePath = '/dashboard/patients'

export const patientCrud = createCrudService(basePath)

export function getPatientStats() {
  return httpClient.get(`${basePath}/stats`)
}

export function getPatientAppointments(patientUuid, params = {}) {
  return httpClient.get(`${basePath}/${patientUuid}/appointments`, { params })
}

export function getPatientPrescriptions(patientUuid, params = {}) {
  return httpClient.get(`${basePath}/${patientUuid}/prescriptions`, { params })
}

export function getPatientMedicalHistory(patientUuid) {
  return httpClient.get(`${basePath}/${patientUuid}/medical-history`)
}

export function searchPatients(query) {
  return httpClient.get(`${basePath}/search`, { params: { q: query } })
}

export default {
  ...patientCrud,
  getPatientStats,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientMedicalHistory,
  searchPatients,
}
