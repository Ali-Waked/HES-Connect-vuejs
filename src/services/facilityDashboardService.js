import axiosClient from '@/axiosClient';

export function getDashboard(params = {}) {
  return axiosClient.get('/facility/dashboard', { params });
}
