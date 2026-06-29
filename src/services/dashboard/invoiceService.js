import axiosClient from '@/axiosClient'

export function getInvoices(params = {}) {
  return axiosClient.get('/dashboard/invoices', { params })
}

export function getInvoice(uuid) {
  return axiosClient.get(`/dashboard/invoices/${uuid}`)
}

export function getInvoiceStats() {
  return axiosClient.get('/dashboard/invoices/stats')
}

export function markInvoicePaid(uuid) {
  return axiosClient.post(`/dashboard/invoices/${uuid}/mark-paid`)
}

export function markInvoiceUnpaid(uuid) {
  return axiosClient.post(`/dashboard/invoices/${uuid}/mark-unpaid`)
}

export function deleteInvoice(uuid) {
  return axiosClient.delete(`/dashboard/invoices/${uuid}`)
}

export function downloadInvoice(uuid) {
  return axiosClient.get(`/dashboard/invoices/${uuid}/download`, {
    responseType: 'blob',
  })
}
