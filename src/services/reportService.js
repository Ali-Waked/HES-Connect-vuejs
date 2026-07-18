import axiosClient from '@/axiosClient';

export const getReports = (params) => axiosClient.get('/dashboard/reports', { params });

export async function exportExcel(filters) {
  const res = await axiosClient.get('/dashboard/reports/export/excel', {
    params: filters,
    responseType: 'blob',
  });
  const contentType = res.headers['content-type'] || '';
  if (contentType.includes('application/json') || contentType.includes('text/html')) {
    const text = await res.data.text();
    const json = JSON.parse(text);
    throw { response: { data: json } };
  }
  return res;
}

export async function exportPdf(filters) {
  const res = await axiosClient.get('/dashboard/reports/export/pdf', {
    params: filters,
    responseType: 'blob',
  });
  const contentType = res.headers['content-type'] || '';
  if (contentType.includes('application/json') || contentType.includes('text/html')) {
    const text = await res.data.text();
    const json = JSON.parse(text);
    throw { response: { data: json } };
  }
  return res;
}
