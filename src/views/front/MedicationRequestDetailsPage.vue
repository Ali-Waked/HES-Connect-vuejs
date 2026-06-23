<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
      <button class="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-primary transition cursor-pointer mb-6" @click="$router.push('/medication-requests')">
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        Back to Medication Requests
      </button>

      <!-- Loading -->
      <div v-if="loading" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse space-y-4">
        <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48" />
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-xl border p-8 text-center"
        :class="error === 'Not Found' ? 'border-slate-200 dark:border-slate-700' : 'border-red-200 dark:border-red-800'">
        <span class="material-symbols-outlined text-4xl mb-2" :class="error === 'Not Found' ? 'text-slate-400' : 'text-red-400'">
          {{ error === 'Not Found' ? 'search_off' : 'error_outline' }}
        </span>
        <p class="text-sm" :class="error === 'Not Found' ? 'text-slate-500 dark:text-slate-400' : 'text-red-500 dark:text-red-400'">
          {{ error === 'Not Found' ? 'Medication request not found' : error }}
        </p>
        <button class="mt-3 text-sm font-semibold text-brand-primary cursor-pointer" @click="fetchRequest">
          {{ error === 'Not Found' ? 'Go back' : 'Retry' }}
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="request" class="space-y-6">

        <!-- Header Card -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Medication Request</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">{{ shortUuid(request.uuid) }}</p>
            </div>
            <span class="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="statusClass(request.status)">
              {{ request.status }}
            </span>
          </div>

          <!-- Status Timeline -->
          <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Status Timeline</p>
            <div class="flex items-center gap-0">
              <div class="flex items-center gap-2 flex-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :class="timelineStep('pending')">
                  <span class="material-symbols-outlined text-sm">pending</span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold" :class="timelineTextClass('pending')">Pending</p>
                  <p v-if="request.status === 'pending'" class="text-[10px] text-slate-400 dark:text-slate-500">Current</p>
                </div>
              </div>
              <div class="h-0.5 flex-1" :class="timelineLineClass('pending')" />
              <div class="flex items-center gap-2 flex-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :class="timelineStep('approved')">
                  <span class="material-symbols-outlined text-sm">check</span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold" :class="timelineTextClass('approved')">Approved</p>
                  <p v-if="request.status === 'approved'" class="text-[10px] text-slate-400 dark:text-slate-500">Current</p>
                </div>
              </div>
              <div class="h-0.5 flex-1" :class="timelineLineClass('approved')" />
              <div class="flex items-center gap-2 flex-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :class="timelineStep('rejected')">
                  <span class="material-symbols-outlined text-sm">close</span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold" :class="timelineTextClass('rejected')">Rejected</p>
                  <p v-if="request.status === 'rejected'" class="text-[10px] text-slate-400 dark:text-slate-500">Current</p>
                </div>
              </div>
              <div class="h-0.5 flex-1" :class="timelineLineClass('rejected')" />
              <div class="flex items-center gap-2 flex-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :class="timelineStep('cancelled')">
                  <span class="material-symbols-outlined text-sm">block</span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold" :class="timelineTextClass('cancelled')">Cancelled</p>
                  <p v-if="request.status === 'cancelled'" class="text-[10px] text-slate-400 dark:text-slate-500">Current</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pharmacy Info -->
        <div v-if="request.facility" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Pharmacy</h2>
          <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <img v-if="request.facility.cover_image" :src="request.facility.cover_image" :alt="resolveTranslatedValue(request.facility.name, locale)" class="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div v-else class="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-brand-primary text-2xl">local_pharmacy</span>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(request.facility.name, locale) }}</p>
              <p v-if="request.facility.city || request.facility.address" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ request.facility.city || request.facility.address }}</p>
            </div>
          </div>
        </div>

        <!-- Medicines -->
        <div v-if="medicines.length" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Medicines ({{ medicines.length }})</h2>
          <div class="overflow-x-auto -mx-6">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th class="px-6 py-3 min-w-[160px]">Medicine</th>
                  <th class="px-6 py-3 text-right">Qty</th>
                  <th class="px-6 py-3 text-right">Unit Price</th>
                  <th class="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                <tr v-for="(item, i) in medicines" :key="i" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                  <td class="px-6 py-3.5">
                    <div class="flex items-center gap-3">
                      <img v-if="item.medicine?.image_url" :src="item.medicine.image_url" :alt="resolveTranslatedValue(item.medicine?.name, locale)" class="w-9 h-9 rounded-lg object-cover shrink-0" />
                      <div v-else class="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-brand-primary text-lg">medication</span>
                      </div>
                      <span class="font-semibold text-slate-900 dark:text-white">{{ resolveTranslatedValue(item.medicine?.name || item.name, locale) || '—' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-3.5 text-right font-semibold text-slate-900 dark:text-white">{{ item.quantity ?? '—' }}</td>
                  <td class="px-6 py-3.5 text-right text-slate-600 dark:text-slate-400">{{ item.unit_price ? formatPrice(item.unit_price) : '—' }}</td>
                  <td class="px-6 py-3.5 text-right font-semibold text-slate-900 dark:text-white">{{ item.total_price ? formatPrice(item.total_price) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-brand-primary/5 -mx-6 px-6 py-4 rounded-b-xl">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Prescription Price</span>
            <span class="text-lg font-extrabold text-brand-primary">{{ totalPrice ? formatPrice(totalPrice) : '—' }}</span>
          </div>
        </div>

        <!-- Prescription Reference -->
        <div v-if="request.prescription_uuid" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Prescription</h2>
          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-brand-primary text-lg">description</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">Prescription</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{{ shortUuid(request.prescription_uuid) }}</p>
              </div>
            </div>
            <button class="shrink-0 text-sm font-semibold text-brand-primary hover:underline cursor-pointer" @click="$router.push(`/prescriptions/${request.prescription_uuid}`)">
              View
            </button>
          </div>
        </div>

        <!-- Cancel Button -->
        <div v-if="request.status === 'pending'" class="flex justify-center">
          <button
            :disabled="cancelling"
            class="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer disabled:opacity-50"
            @click="showCancelDialog = true"
          >
            <span v-if="cancelling" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-sm">cancel</span>
            Cancel Request
          </button>
        </div>
      </div>
    </main>

    <!-- Cancel Confirmation Dialog -->
    <BaseDialog :show="showCancelDialog" title="Cancel Request" size="sm" @close="showCancelDialog = false">
      <div class="text-center">
        <div class="w-14 h-14 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl text-red-500">cancel</span>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Are you sure you want to cancel this medication request? This action cannot be undone.
        </p>
      </div>
      <template #footer>
        <button
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer"
          @click="showCancelDialog = false"
        >
          Keep Request
        </button>
        <button
          :disabled="cancelling"
          class="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          @click="handleCancel"
        >
          <span v-if="cancelling" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          Yes, Cancel Request
        </button>
      </template>
    </BaseDialog>

    <PublicToastContainer />
    <LandingFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue'
import PublicToastContainer from '@/components/global/PublicToastContainer.vue'
import { usePublicToast } from '@/composables/usePublicToast'
import { getMedicationRequest, cancelMedicationRequest } from '@/services/medicationRequestService'
import { resolveTranslatedValue } from '@/utils/locale'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

const request = ref(null)
const loading = ref(false)
const error = ref(null)
const cancelling = ref(false)
const showCancelDialog = ref(false)

const { addToast } = usePublicToast()

const medicines = computed(() => {
  return request.value?.prescription?.items || []
})

const totalPrice = computed(() => {
  return request.value?.total_price
})

function formatPrice(price) {
  if (price == null || isNaN(price)) return '—'
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' EGP'
}

function statusClass(status) {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'cancelled': return 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
    default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  }
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

function timelineStep(step) {
  const s = request.value?.status
  if (s === 'cancelled') {
    if (step === 'cancelled') return 'bg-slate-500 text-white'
    if (step === 'pending') return 'bg-emerald-500 text-white'
    return 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
  }
  if (s === 'rejected') {
    if (step === 'rejected') return 'bg-red-500 text-white'
    if (step === 'pending') return 'bg-emerald-500 text-white'
    return 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
  }
  const statusMap = { pending: 0, approved: 1, rejected: 2, cancelled: 2 }
  const currentIdx = statusMap[s] ?? 0
  const stepIdx = statusMap[step]
  if (currentIdx >= stepIdx) return 'bg-emerald-500 text-white'
  return 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
}

function timelineTextClass(step) {
  const s = request.value?.status
  if (s === 'cancelled') {
    if (step === 'cancelled') return 'text-slate-600 dark:text-slate-400'
    return 'text-slate-900 dark:text-white'
  }
  if (s === 'rejected') {
    if (step === 'rejected') return 'text-red-600 dark:text-red-400'
    return 'text-slate-900 dark:text-white'
  }
  return 'text-slate-900 dark:text-white'
}

function timelineLineClass(step) {
  const s = request.value?.status
  if (s === 'cancelled') {
    if (step === 'pending' || step === 'approved') return 'bg-emerald-400'
    return 'bg-slate-200 dark:bg-slate-600'
  }
  if (s === 'rejected') {
    return 'bg-red-300 dark:bg-red-700'
  }
  const statusMap = { pending: 0, approved: 1, rejected: 2, cancelled: 2 }
  const currentIdx = statusMap[s] ?? 0
  const stepIdx = statusMap[step]
  return currentIdx > stepIdx ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-600'
}

async function fetchRequest() {
  loading.value = true
  error.value = null
  const uuid = route.params.uuid
  try {
    const { data } = await getMedicationRequest(uuid)
    request.value = data.data || data
  } catch (err) {
    if (err.response?.status === 401) {
      router.push('/login')
      return
    }
    if (err.response?.status === 403) {
      error.value = 'You do not have permission to view this medication request.'
      return
    }
    if (err.response?.status === 404) {
      error.value = 'Not Found'
      return
    }
    error.value = err.response?.data?.message || 'Failed to load medication request'
    request.value = null
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  cancelling.value = true
  try {
    await cancelMedicationRequest(route.params.uuid)
    showCancelDialog.value = false
    addToast('Medication request cancelled successfully', 'success')
    await fetchRequest()
  } catch (err) {
    addToast(err.response?.data?.message || 'Failed to cancel request', 'error')
  } finally {
    cancelling.value = false
  }
}

onMounted(fetchRequest)
</script>
