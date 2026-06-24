import * as doctorService from '@/services/public/doctorService'

export function getDoctors(params = {}) {
  return doctorService.getDoctors(params)
}

export function getDoctorDetail(uuid) {
  return doctorService.getDoctorDetail(uuid)
}
