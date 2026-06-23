<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
      <button class="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-primary transition cursor-pointer mb-6" @click="$router.push('/prescriptions')">
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        Back to Prescriptions
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
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-red-400 mb-2">error_outline</span>
        <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        <button class="mt-3 text-sm font-semibold text-brand-primary cursor-pointer" @click="fetchPrescription">Retry</button>
      </div>

      <!-- Content -->
      <div v-else-if="prescription" class="space-y-6">

        <!-- Prescription Info -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Prescription Details</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">{{ shortUuid(prescription.uuid) }}</p>
            </div>
            <span class="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="statusClasses(prescription.status)">{{ prescription.status }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Doctor</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(prescription.doctor?.name, locale) || '—' }}</p>
              <p v-if="prescription.doctor?.specialization" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ resolveTranslatedValue(prescription.doctor.specialization, locale) }}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Facility</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(prescription.facility?.name, locale) || '—' }}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Created Date</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatDate(prescription.created_at) }}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Medicines</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ itemsCount }}</p>
            </div>
          </div>

          <div v-if="prescription.reason" class="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Reason</p>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ prescription.reason }}</p>
          </div>
          <div v-if="prescription.notes" class="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notes</p>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ prescription.notes }}</p>
          </div>
          <div v-if="prescription.cancellation_reason" class="mt-4 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl">
            <p class="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Cancellation Reason</p>
            <p class="text-sm text-rose-700 dark:text-rose-400 leading-relaxed">{{ prescription.cancellation_reason }}</p>
          </div>
        </div>

        <!-- Medicines -->
        <div v-if="medicines.length" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Medicines</h2>
          <div class="space-y-3">
            <div v-for="(item, i) in medicines" :key="i"
              class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div class="flex items-start gap-3">
                <img v-if="item.medicine?.image_url" :src="item.medicine.image_url" :alt="resolveTranslatedValue(item.medicine?.name, locale)" class="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5 cursor-pointer" @click="previewImage = item.medicine.image_url" />
                <div v-else class="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-brand-primary text-base">medication</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(item.medicine?.name || item.name || item.medicine_name, locale) || '—' }}</p>
                  <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div v-if="item.dosage || item.dose">
                      <span class="text-slate-400 dark:text-slate-500">Dosage:</span>
                      <span class="text-slate-700 dark:text-slate-300 font-semibold ml-1">{{ item.dosage || item.dose }}</span>
                    </div>
                    <div v-if="item.frequency">
                      <span class="text-slate-400 dark:text-slate-500">Frequency:</span>
                      <span class="text-slate-700 dark:text-slate-300 font-semibold ml-1">{{ item.frequency }}</span>
                    </div>
                    <div v-if="item.duration">
                      <span class="text-slate-400 dark:text-slate-500">Duration:</span>
                      <span class="text-slate-700 dark:text-slate-300 font-semibold ml-1">{{ item.duration }}</span>
                    </div>
                    <div v-if="item.instructions">
                      <span class="text-slate-400 dark:text-slate-500">Instructions:</span>
                      <span class="text-slate-700 dark:text-slate-300 font-semibold ml-1">{{ item.instructions }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Pharmacy -->
        <div v-if="hasSelectedPharmacy" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Selected Pharmacy</h2>
          <div class="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">check_circle</span>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(selectedPharmacy?.name, locale) || resolveTranslatedValue(prescription.selected_pharmacy_name, locale) || 'Pharmacy selected' }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pharmacy has been selected for this prescription</p>
            </div>
          </div>
        </div>

        <!-- Available Pharmacies -->
        <div v-else-if="!pharmaciesLoading && !hasSelectedPharmacy" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-1">Select Pharmacy</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose a pharmacy to dispense this prescription</p>

          <!-- Pharmacies Loading -->
          <div v-if="pharmaciesLoading" class="space-y-3">
            <div v-for="n in 2" :key="n" class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl animate-pulse">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-2" />
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            </div>
          </div>

          <!-- Pharmacies Empty -->
          <div v-else-if="!pharmacies.length" class="text-center py-6">
            <div class="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl text-slate-400">local_pharmacy</span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">No pharmacies available</p>
          </div>

          <!-- Pharmacies List -->
          <div v-else class="space-y-3">
            <div v-for="pharmacy in sortedPharmacies" :key="pharmacy.uuid"
              class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <img v-if="pharmacy.cover_image" :src="pharmacy.cover_image" :alt="resolveTranslatedValue(pharmacy.name, locale)" class="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div v-else class="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-brand-primary text-xl">local_pharmacy</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(pharmacy.name, locale) }}</p>
                <p v-if="pharmacy.total_price !== undefined && pharmacy.total_price !== null" class="text-xs font-semibold text-brand-primary mt-0.5">{{ Number(pharmacy.total_price).toFixed(2) }} EGP</p>
                <div class="flex items-center gap-3 mt-1.5">
                  <div class="flex-1 max-w-[160px]">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="text-slate-500 dark:text-slate-400">Coverage</span>
                      <span class="font-semibold" :class="pharmacy.can_fulfill ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">{{ pharmacy.coverage_percentage }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-300" :class="pharmacy.can_fulfill ? 'bg-emerald-500' : 'bg-amber-400'" :style="{ width: pharmacy.coverage_percentage + '%' }"></div>
                    </div>
                  </div>
                  <span v-if="!pharmacy.can_fulfill" class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full" title="Cannot fully fulfill prescription">
                    <span class="material-symbols-outlined text-xs">warning</span>
                    Partial
                  </span>
                  <span v-else class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                    <span class="material-symbols-outlined text-xs">check_circle</span>
                    Full
                  </span>
                </div>
              </div>
              <button
                :disabled="!pharmacy.can_fulfill || (selecting && selectingPharmacy === pharmacy.uuid)"
                :title="!pharmacy.can_fulfill ? 'Cannot fully fulfill prescription' : ''"
                class="shrink-0 inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :class="pharmacy.can_fulfill ? 'bg-brand-primary text-white hover:bg-brand-primary-dark' : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'"
                @click="pharmacyToSelect = pharmacy; showSelectDialog = true"
              >
                <span v-if="selecting && selectingPharmacy === pharmacy.uuid" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span v-else class="material-symbols-outlined text-sm">check</span>
                Select
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Image preview lightbox -->
    <div v-if="previewImage" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" @click="previewImage = null">
      <img :src="previewImage" class="max-w-full max-h-full rounded-xl shadow-2xl object-contain cursor-pointer" @click.stop @click.right.prevent />
      <button class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer" @click="previewImage = null">
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>
    </div>

    <!-- Select Pharmacy Confirmation Dialog -->
    <BaseDialog :show="showSelectDialog" title="Confirm Selection" size="sm" @close="showSelectDialog = false">
      <div class="text-center">
        <div class="w-14 h-14 mx-auto mb-4 bg-brand-primary/10 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl text-brand-primary">local_pharmacy</span>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Are you sure you want to select <strong class="text-slate-900 dark:text-white">{{ resolveTranslatedValue(pharmacyToSelect?.name, locale) }}</strong> to dispense this prescription?
        </p>
        <p v-if="pharmacyToSelect?.total_price !== undefined && pharmacyToSelect?.total_price !== null" class="text-xs text-brand-primary font-semibold mt-2">
          Total: {{ Number(pharmacyToSelect.total_price).toFixed(2) }} EGP
        </p>
      </div>
      <template #footer>
        <button
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer"
          @click="showSelectDialog = false"
        >
          Cancel
        </button>
        <button
          :disabled="selecting"
          class="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          @click="confirmSelectPharmacy"
        >
          <span v-if="selecting" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          Confirm
        </button>
      </template>
    </BaseDialog>

    <PublicToastContainer />
    <LandingFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue'
import PublicToastContainer from '@/components/global/PublicToastContainer.vue'
import { getPatientPrescription, getPrescriptionPharmacies, selectPharmacy } from '@/services/patientPrescriptionService'
import { resolveTranslatedValue } from '../../utils/locale'
import { usePublicToast } from '@/composables/usePublicToast'

const props = defineProps({ uuid: { type: String, required: true } })

const { locale } = useI18n()
const router = useRouter()

const prescription = ref(null)
const loading = ref(false)
const error = ref(null)

const previewImage = ref(null)

const pharmacies = ref([])
const pharmaciesLoading = ref(false)

const selecting = ref(false)
const selectingPharmacy = ref(null)
const showSelectDialog = ref(false)
const pharmacyToSelect = ref(null)

const { addToast } = usePublicToast()

const medicines = computed(() => {
  return prescription.value?.items || prescription.value?.medicines || []
})

const itemsCount = computed(() => {
  return prescription.value?.items_count ?? prescription.value?.items?.length ?? prescription.value?.medicines?.length ?? 0
})

const sortedPharmacies = computed(() => {
  return [...pharmacies.value].sort((a, b) => {
    if (a.can_fulfill !== b.can_fulfill) return a.can_fulfill ? -1 : 1
    return (b.coverage_percentage ?? 0) - (a.coverage_percentage ?? 0)
  })
})

const hasSelectedPharmacy = computed(() => {
  return prescription.value?.status === 'pharmacy_selected' || prescription.value?.selected_pharmacy || prescription.value?.selectedPharmacy
})

const selectedPharmacy = computed(() => {
  return prescription.value?.selected_pharmacy || prescription.value?.selectedPharmacy || null
})

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

function statusClasses(status) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'dispensed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'completed': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
}

async function fetchPrescription() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getPatientPrescription(props.uuid)
    prescription.value = data.data || data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load prescription'
    prescription.value = null
  } finally {
    loading.value = false
  }
}

async function fetchPharmacies() {
  pharmaciesLoading.value = true
  try {
    const { data } = await getPrescriptionPharmacies(props.uuid)
    pharmacies.value = data.data || data || []
  } catch {
    pharmacies.value = []
  } finally {
    pharmaciesLoading.value = false
  }
}

async function confirmSelectPharmacy() {
  if (!pharmacyToSelect.value) return
  selecting.value = true
  selectingPharmacy.value = pharmacyToSelect.value.uuid
  try {
    const res = await selectPharmacy(props.uuid, pharmacyToSelect.value.uuid)
    showSelectDialog.value = false
    addToast('Pharmacy selected successfully!', 'success')
    const medicationRequestUuid = res.data?.data?.medication_request_uuid
    if (medicationRequestUuid) {
      setTimeout(() => router.push(`/medication-requests/${medicationRequestUuid}`), 1500)
    }
  } catch (err) {
    if (err.response?.status === 403) {
      addToast('You are not authorized to select a pharmacy for this prescription.', 'error')
    } else if (err.response?.status === 422) {
      addToast(err.response?.data?.message || 'This pharmacy cannot fulfill the prescription.', 'error')
    } else {
      addToast(err.response?.data?.message || 'Failed to select pharmacy. Please try again.', 'error')
    }
    selecting.value = false
    selectingPharmacy.value = null
  }
}

onMounted(async () => {
  await fetchPrescription()
  if (!selectedPharmacy.value) {
    fetchPharmacies()
  }
})
</script>
