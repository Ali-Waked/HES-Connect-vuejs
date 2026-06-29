import axiosClient from '@/axiosClient';

export const getReports = (params) => axiosClient.get('/dashboard/reports', { params });

export const exportExcel = (filters) =>
  axiosClient.get('/dashboard/reports/export/excel', {
    params: filters,
    responseType: 'blob',
  });

export const exportPdf = (filters) =>
  axiosClient.get('/dashboard/reports/export/pdf', {
    params: filters,
    responseType: 'blob',
  });
