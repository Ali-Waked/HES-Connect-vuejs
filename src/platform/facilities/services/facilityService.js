import httpClient from '@/shared/http/httpClient'
import { createCrudService, createFormDataService } from '@/shared/http/serviceFactory'

const basePath = '/dashboard/facilities'

export const facilityCrud = createCrudService(basePath)

export const facilityFormData = createFormDataService(basePath)

export function getFacilityStats() {
  return httpClient.get(`${basePath}/stats`)
}

export function getFacilityReviewStats(uuid) {
  return httpClient.get(`${basePath}/${uuid}/review-stats`)
}

export function toggleFacilityStatus(id, status) {
  return httpClient.patch(`${basePath}/${id}/status`, { status })
}

export function toggleFacilityFeature(id, isFeatured) {
  return httpClient.patch(`${basePath}/${id}/feature`, { is_featured: isFeatured })
}

export function getFacilityTypes() {
  return httpClient.get(`${basePath}/types`)
}

export default {
  ...facilityCrud,
  ...facilityFormData,
  getFacilityStats,
  getFacilityReviewStats,
  toggleFacilityStatus,
  toggleFacilityFeature,
  getFacilityTypes,
}
