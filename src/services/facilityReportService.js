import axiosClient from '@/axiosClient';

export function getReports(params = {}) {
  return axiosClient.get('/facility/reports', { params });
}

export function exportExcel(params = {}) {
  return axiosClient.get('/facility/reports/export/excel', {
    params,
    responseType: 'blob',
  });
}

export function exportPdf(params = {}) {
  return axiosClient.get('/facility/reports/export/pdf', {
    params,
    responseType: 'blob',
  });
}
