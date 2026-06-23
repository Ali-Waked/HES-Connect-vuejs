import axiosClient from '@/axiosClient'

export function getPatientPrescriptions(params = {}) {
  return axiosClient.get('/patient/prescriptions', { params })
}

export function getPatientPrescription(uuid) {
  return axiosClient.get(`/patient/prescriptions/${uuid}`)
}

export function getPrescriptionPharmacies(uuid) {
  return axiosClient.get(`/patient/prescriptions/${uuid}/pharmacies`)
}

export function selectPharmacy(uuid, facilityUuid) {
  return axiosClient.post(`/patient/prescriptions/${uuid}/select-pharmacy`, null, {
    params: { facility_id: facilityUuid }
  })
}
