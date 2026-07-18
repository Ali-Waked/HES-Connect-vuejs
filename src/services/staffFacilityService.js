import axiosClient from '@/axiosClient'

export function getStaffFacilities() {
  return axiosClient.get('/staff/facilities')
}

export function getStaffFacilitiesById(staffId) {
  return axiosClient.get(`/doctors/${staffId}/facilities`)
}

export function getAvailableDays(facilityId, staffId) {
  return axiosClient.get(`/doctors/${facilityId}/${staffId}/available-days`)
}

export function getAvailableSlots(facilityId, staffId, params = {}) {
  return axiosClient.get(`/doctors/${facilityId}/${staffId}/available-slots`, { params })
}

export function getStaffByFacility(facilityId) {
  return axiosClient.get(`/dashboard/${facilityId}/staffs`)
}
