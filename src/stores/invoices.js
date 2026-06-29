import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as invoiceService from '../services/dashboard/invoiceService'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([])
  const loading = ref(false)
  const error = ref(null)

  const stats = computed(() => {
    const totalRevenue = invoices.value.filter(inv => inv.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0)
    return {
      total: invoices.value.length,
      paid: invoices.value.filter(inv => inv.status === 'paid').length,
      unpaid: invoices.value.filter(inv => inv.status === 'unpaid').length,
      revenue: totalRevenue.toFixed(2),
    }
  })

  async function fetchInvoices(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await invoiceService.getInvoices(params)
      invoices.value = (res.data.data || res.data).map(normalizeInvoice)
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load invoices'
    } finally {
      loading.value = false
    }
  }

  function normalizeInvoice(inv) {
    return {
      id: inv.id,
      appointment_id: inv.appointment_id,
      patient_name: inv.patient_name || inv.patient?.name || 'Unknown',
      amount: Number(inv.amount) || 0,
      status: inv.status,
      created_at: inv.created_at,
      items: Array.isArray(inv.items) ? inv.items.map(item => ({
        description: item.description || item.name,
        price: Number(item.price || item.amount) || 0,
      })) : [],
    }
  }

  async function markAsPaid(id) {
    try {
      const inv = invoices.value.find(i => i.id === id)
      if (inv) inv.status = 'paid'
      await invoiceService.markInvoicePaid(id)
    } catch {
      const inv = invoices.value.find(i => i.id === id)
      if (inv) inv.status = 'unpaid'
    }
  }

  async function markAsUnpaid(id) {
    try {
      const inv = invoices.value.find(i => i.id === id)
      if (inv) inv.status = 'unpaid'
      await invoiceService.markInvoiceUnpaid(id)
    } catch {
      const inv = invoices.value.find(i => i.id === id)
      if (inv) inv.status = 'paid'
    }
  }

  async function deleteInvoice(id) {
    const previous = invoices.value
    invoices.value = invoices.value.filter(i => i.id !== id)
    try {
      await invoiceService.deleteInvoice(id)
    } catch {
      invoices.value = previous
    }
  }

  async function downloadInvoicePdf(uuid) {
    try {
      const res = await invoiceService.downloadInvoice(uuid)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${uuid}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = 'Failed to download invoice'
    }
  }

  return {
    invoices,
    stats,
    loading,
    error,
    fetchInvoices,
    markAsPaid,
    markAsUnpaid,
    deleteInvoice,
    downloadInvoicePdf,
  }
})
