import axiosClient from '@/axiosClient'

export function getSpecializations(params = {}) {
  return axiosClient.get('/dashboard/specializations', { params })
}

export function getSpecializationsLookup() {
  return axiosClient.get('/dashboard/specializations/lookup')
}

export function getSpecialization(uuid) {
  return axiosClient.get(`/dashboard/specializations/${uuid}`)
}

export function createSpecialization(data) {
  return axiosClient.post('/dashboard/specializations', {
    name: { en: data.name_en, ar: data.name_ar },
    description: { en: data.description_en, ar: data.description_ar },
  })
}

export function updateSpecialization(uuid, data) {
  return axiosClient.put(`/dashboard/specializations/${uuid}`, {
    name: { en: data.name_en, ar: data.name_ar },
    description: { en: data.description_en, ar: data.description_ar },
  })
}

export function deleteSpecialization(uuid) {
  return axiosClient.delete(`/dashboard/specializations/${uuid}`)
}

export function getSpecializationSymptoms(uuid) {
  return axiosClient.get(`/dashboard/specializations/${uuid}/symptoms`)
}

export function syncSpecializationSymptoms(uuid, symptomIds) {
  return axiosClient.put(`/dashboard/specializations/${uuid}/symptoms`, {
    symptom_ids: symptomIds,
  })
}

export function attachSpecializationSymptoms(uuid, symptomIds) {
  return axiosClient.post(`/dashboard/specializations/${uuid}/symptoms`, {
    symptom_ids: symptomIds,
  })
}

export function detachSpecializationSymptom(uuid, symptomId) {
  return axiosClient.delete(`/dashboard/specializations/${uuid}/symptoms/${symptomId}`)
}
