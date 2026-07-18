import axiosClient from '@/axiosClient';

export function getDashboard(facilityUuid, params = {}) {
  return axiosClient.get(`/facility/${facilityUuid}/dashboard`, { params });
}
