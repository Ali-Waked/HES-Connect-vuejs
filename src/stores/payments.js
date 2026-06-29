import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as paymentService from '../services/dashboard/paymentService'

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref([])
  const loading = ref(false)
  const error = ref(null)

  const stats = computed(() => {
    const totalAmount = payments.value.reduce((acc, curr) => acc + curr.amount, 0)
    const byMethod = payments.value.reduce((acc, curr) => {
      acc[curr.method] = (acc[curr.method] || 0) + 1
      return acc
    }, {})
    return {
      total: payments.value.length,
      amount: totalAmount.toFixed(2),
      methods: Object.keys(byMethod).length,
    }
  })

  async function fetchPayments(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await paymentService.getPayments(params)
      payments.value = (res.data.data || res.data).map(normalizePayment)
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load payments'
    } finally {
      loading.value = false
    }
  }

  function normalizePayment(p) {
    return {
      id: p.id,
      invoice_id: p.invoice_id || p.invoice?.id,
      amount: Number(p.amount) || 0,
      method: p.method || p.payment_method || 'Unknown',
      created_at: p.created_at || p.createdAt,
      transaction_ref: p.transaction_ref || p.transactionReference || '—',
    }
  }

  async function deletePayment(id) {
    const previous = payments.value
    payments.value = payments.value.filter(p => p.id !== id)
    try {
      await paymentService.getPayment(id)
    } catch {
      payments.value = previous
    }
  }

  return {
    payments,
    stats,
    loading,
    error,
    fetchPayments,
    deletePayment,
  }
})
