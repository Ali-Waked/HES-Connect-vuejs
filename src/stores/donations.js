import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as donationService from '../services/dashboard/donationService'

export const useDonationsStore = defineStore('donations', () => {
  const donations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const stats = computed(() => {
    const totalAmount = donations.value.reduce((acc, curr) => acc + (curr.amount || 0), 0)
    const byStatus = donations.value.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1
      return acc
    }, {})
    return {
      total: donations.value.length,
      totalAmount: totalAmount.toFixed(2),
      completed: byStatus.completed || byStatus.succeeded || 0,
      pending: byStatus.pending || 0,
      failed: byStatus.failed || 0,
    }
  })

  async function fetchDonations(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await donationService.getDonations(params)
      donations.value = (res.data.data || res.data).map(normalizeDonation)
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load donations'
    } finally {
      loading.value = false
    }
  }

  function normalizeDonation(d) {
    return {
      id: d.id,
      uuid: d.uuid || d.id,
      donor_name: d.donor_name || d.donor?.name || 'Anonymous',
      donor_email: d.donor_email || d.donor?.email || '',
      amount: Number(d.amount) || 0,
      currency: d.currency || 'USD',
      status: d.status || 'pending',
      story_id: d.story_id || d.story?.id,
      story_title: d.story_title || d.story?.title || 'General Donation',
      message: d.message || '',
      payment_method: d.payment_method || d.payment?.method || '',
      transaction_ref: d.transaction_ref || d.transactionReference || '',
      created_at: d.created_at || d.createdAt,
      updated_at: d.updated_at || d.updatedAt,
    }
  }

  return {
    donations,
    stats,
    loading,
    error,
    fetchDonations,
  }
})
