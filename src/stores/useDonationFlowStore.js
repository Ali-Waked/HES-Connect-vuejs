import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createDonationCheckout, getDonation } from '@/services/public/donationService'

export const useDonationFlowStore = defineStore('donationFlow', () => {
  const currentDonation = ref(null)
  const checkoutLoading = ref(false)
  const checkoutError = ref(null)
  const statusPolling = ref(false)
  let pollTimer = null

  async function initiateCheckout(storyId, { amount, message }) {
    checkoutLoading.value = true
    checkoutError.value = null
    try {
      const { data } = await createDonationCheckout(storyId, { amount, message })
      const checkoutUrl = data?.checkout_url || data?.url || data?.data?.checkout_url
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        checkoutError.value = 'No checkout URL returned'
      }
    } catch (err) {
      checkoutError.value = err.response?.data?.message || 'Failed to initiate checkout'
      throw err
    } finally {
      checkoutLoading.value = false
    }
  }

  async function fetchDonationStatus(donationId) {
    try {
      const { data } = await getDonation(donationId)
      currentDonation.value = data.data || data
      return currentDonation.value
    } catch {
      return null
    }
  }

  function startPolling(donationId, interval = 4000) {
    stopPolling()
    statusPolling.value = true
    fetchDonationStatus(donationId)
    pollTimer = setInterval(() => {
      fetchDonationStatus(donationId)
    }, interval)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    statusPolling.value = false
  }

  function reset() {
    currentDonation.value = null
    checkoutLoading.value = false
    checkoutError.value = null
    stopPolling()
  }

  return {
    currentDonation,
    checkoutLoading,
    checkoutError,
    statusPolling,
    initiateCheckout,
    fetchDonationStatus,
    startPolling,
    stopPolling,
    reset,
  }
})
