import axiosClient from '@/axiosClient'

function hasFiles(data) {
  return Object.values(data).some(v => v instanceof File || v instanceof FileList) ||
    (data.avatar instanceof File) || (data.cover_image instanceof File)
}

function toFormData(data) {
  const fd = new FormData()

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue

    if (key === 'name' || key === 'specialization' || key === 'bio') {
      if (value.en) fd.append(`${key}[en]`, value.en)
      if (value.ar) fd.append(`${key}[ar]`, value.ar)
    } else if (key === 'facilities' && Array.isArray(value)) {
      value.forEach((fac, i) => {
        if (fac.facility_uuid) fd.append(`facilities[${i}][facility_uuid]`, fac.facility_uuid)
        if (fac.role_uuid) fd.append(`facilities[${i}][role_uuid]`, fac.role_uuid)
        if (fac.department_uuid) fd.append(`facilities[${i}][department_uuid]`, fac.department_uuid)
        if (fac.position_uuid) fd.append(`facilities[${i}][position_uuid]`, fac.position_uuid)
      })
    } else if (value instanceof File) {
      fd.append(key, value)
    } else if (typeof value === 'object') {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (subValue !== null && subValue !== undefined) {
          fd.append(`${key}[${subKey}]`, String(subValue))
        }
      }
    } else {
      fd.append(key, String(value))
    }
  }

  return fd
}

export function getStaff(params = {}) {
  return axiosClient.get('/dashboard/staff', { params })
}

export function getStaffById(id) {
  return axiosClient.get(`/dashboard/staff/${id}`)
}

export function createStaff(data) {
  const payload = hasFiles(data) ? toFormData(data) : data
  return axiosClient.post('/dashboard/staff', payload)
}

export function updateStaff(id, data) {
  if (hasFiles(data)) {
    const fd = toFormData(data)
    fd.append('_method', 'PUT')
    return axiosClient.post(`/dashboard/staff/${id}`, fd)
  }
  return axiosClient.put(`/dashboard/staff/${id}`, data)
}

export function deleteStaff(id) {
  return axiosClient.delete(`/dashboard/staff/${id}`)
}

export function checkStaffEmail(email) {
  return axiosClient.get('/dashboard/staff/check-email', { params: { email } })
}

export function getPublicStaffByUuid(uuid) {
  return axiosClient.get(`dashboard/staff/${uuid}`)
}

export function terminateStaff(uuid) {
  return axiosClient.post(`/dashboard/staff/${uuid}/terminate`)
}

export function terminateFacilityStaff(facilityStaffUuid) {
  return axiosClient.post(`/dashboard/facility-staff/${facilityStaffUuid}/terminate`)
}
