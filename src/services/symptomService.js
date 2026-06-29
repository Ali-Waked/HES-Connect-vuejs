import axiosClient from '@/axiosClient'

export function getSymptoms(params = {}) {
  return axiosClient.get('/dashboard/symptoms', { params })
}

export function getSymptom(uuid) {
  return axiosClient.get(`/dashboard/symptoms/${uuid}`)
}

export function createSymptom(data) {
  return axiosClient.post('/dashboard/symptoms', {
    name: { en: data.name_en, ar: data.name_ar },
    is_active: data.is_active ?? true,
  })
}

export function updateSymptom(uuid, data) {
  return axiosClient.put(`/dashboard/symptoms/${uuid}`, {
    name: { en: data.name_en, ar: data.name_ar },
    is_active: data.is_active,
  })
}

export function deleteSymptom(uuid) {
  return axiosClient.delete(`/dashboard/symptoms/${uuid}`)
}

export function getSymptomStats() {
  return axiosClient.get('/dashboard/symptoms/stats')
}

export function getFacilitySymptoms(params = {}) {
  return axiosClient.get('/facility/symptoms', { params })
}

export function updateFacilityStaffSymptoms(facilityStaffUuid, symptomIds) {
  return axiosClient.put(`/facility/symptoms/${facilityStaffUuid}`, {
    symptom_ids: symptomIds,
  })
}
