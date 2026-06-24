<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useWorkspaceStore } from '@/stores/workspace'
import { createPrescription } from '@/services/prescriptionService'
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue'
import axiosClient from '@/axiosClient'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'created'])

const staffStore = useStaffStore()
const workspaceStore = useWorkspaceStore()

function getFacilityUuid() {
  try {
    return workspaceStore.currentFacility?.uuid
  } catch {
    return null
  }
}

const saving = ref(false)
const errors = reactive({})

const form = reactive({
  appointment_id: '',
  appointment_label: '',
  notes: '',
  medicines: [
    { medicine_id: null, medicine_label: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' }
  ]
})

const routeOptions = [
  { value: 'oral', label: 'Oral' },
  { value: 'topical', label: 'Topical' },
  { value: 'intravenous', label: 'Intravenous' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'inhalation', label: 'Inhalation' },
  { value: 'ophthalmic', label: 'Ophthalmic' },
  { value: 'otic', label: 'Otic' },
  { value: 'rectal', label: 'Rectal' },
  { value: 'sublingual', label: 'Sublingual' },
  { value: 'buccal', label: 'Buccal' },
]

// ── Appointment Search ──────────────────────

const apptQuery = ref('')
const apptResults = ref([])
const apptLoading = ref(false)
const apptOpen = ref(false)
const apptHighlight = ref(-1)

let apptDebounce = null

function onApptInput(val) {
  clearTimeout(apptDebounce)
  if (!val.trim()) {
    apptResults.value = []
    apptOpen.value = false
    return
  }
  apptDebounce = setTimeout(async () => {
    apptLoading.value = true
    try {
      const facilityUuid = getFacilityUuid()
      const { data } = await axiosClient.get(`/dashboard/facility/${facilityUuid}/appointments/lookup`, {
        params: { search: val.trim() }
      })
      apptResults.value = data.data || []
      apptOpen.value = true
      apptHighlight.value = -1
    } catch {
      apptResults.value = []
    } finally {
      apptLoading.value = false
    }
  }, 350)
}

function selectAppointment(item) {
  form.appointment_id = item.uuid
  form.appointment_label = item.label || ''
  apptQuery.value = item.label || ''
  apptOpen.value = false
}

function onApptBlur() {
  setTimeout(() => { apptOpen.value = false }, 200)
}

function onApptKeydown(e) {
  if (!apptOpen.value || !apptResults.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    apptHighlight.value = Math.min(apptHighlight.value + 1, apptResults.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    apptHighlight.value = Math.max(apptHighlight.value - 1, 0)
  } else if (e.key === 'Enter' && apptHighlight.value >= 0) {
    e.preventDefault()
    selectAppointment(apptResults.value[apptHighlight.value])
  } else if (e.key === 'Escape') {
    apptOpen.value = false
  }
}

// ── Medicine Search ─────────────────────────

const medSearches = reactive([])

function initMedSearch(index) {
  medSearches[index] = reactive({
    query: '',
    results: [],
    loading: false,
    open: false,
    highlightedIndex: -1,
    debounce: null,
  })
}

function onMedInput(val, index) {
  const s = medSearches[index]
  if (!s) return
  clearTimeout(s.debounce)
  if (!val.trim()) {
    s.results = []
    s.open = false
    return
  }
  s.debounce = setTimeout(async () => {
    s.loading = true
    try {
      const { data } = await axiosClient.get('/medicines/lookup', { params: { search: val.trim() } })
      s.results = data.data || data || []
      s.open = true
      s.highlightedIndex = -1
    } catch {
      s.results = []
    } finally {
      s.loading = false
    }
  }, 350)
}

function selectMedicine(item, index) {
  const name = item.name?.en || item.name || item.name_en || ''
  form.medicines[index].medicine_id = item.uuid || item.id
  form.medicines[index].medicine_label = name
  medSearches[index].query = name
  medSearches[index].open = false
}

function onMedBlur(index) {
  setTimeout(() => { if (medSearches[index]) medSearches[index].open = false }, 200)
}

function onMedKeydown(e, index) {
  const s = medSearches[index]
  if (!s || !s.open || !s.results.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    s.highlightedIndex = Math.min(s.highlightedIndex + 1, s.results.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    s.highlightedIndex = Math.max(s.highlightedIndex - 1, 0)
  } else if (e.key === 'Enter' && s.highlightedIndex >= 0) {
    e.preventDefault()
    selectMedicine(s.results[s.highlightedIndex], index)
  } else if (e.key === 'Escape') {
    s.open = false
  }
}

// ── Form helpers ────────────────────────────

function addMedicine() {
  const idx = form.medicines.length
  form.medicines.push({ medicine_id: null, medicine_label: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' })
  nextTick(() => initMedSearch(idx))
}

function removeMedicine(index) {
  if (form.medicines.length > 1) {
    form.medicines.splice(index, 1)
    medSearches.splice(index, 1)
  }
}

function clearErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}

function validate() {
  clearErrors()
  let valid = true

  if (!form.appointment_id) {
    errors.appointment_id = 'Please select an appointment'
    valid = false
  }

  if (form.medicines.length === 0) {
    errors.medicines = 'At least one medicine is required'
    valid = false
  }

  form.medicines.forEach((med, i) => {
    if (!med.medicine_id) {
      errors[`medicines.${i}.medicine_id`] = 'Please select a medicine'
      valid = false
    }
    if (!med.dosage.trim()) {
      errors[`medicines.${i}.dosage`] = 'Dosage is required'
      valid = false
    }
    if (!med.duration.trim()) {
      errors[`medicines.${i}.duration`] = 'Duration is required'
      valid = false
    }
  })

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      appointment_id: form.appointment_id,
      notes: form.notes,
      medicines: form.medicines.map(m => ({
        medicine_id: m.medicine_id,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        route: m.route,
        instructions: m.instructions,
      })),
    }
    await createPrescription(payload)
    staffStore.showToast('Prescription created successfully', 'success')
    emit('created')
    emit('close')
  } catch (err) {
    if (err.response?.status === 422 && err.response.data?.errors) {
      const serverErrors = err.response.data.errors
      for (const key in serverErrors) {
        errors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
      }
    } else {
      staffStore.showToast(err.response?.data?.message || 'Failed to create prescription', 'error')
    }
  } finally {
    saving.value = false
  }
}

function resetForm() {
  clearErrors()
  form.appointment_id = ''
  form.appointment_label = ''
  form.notes = ''
  apptQuery.value = ''
  apptResults.value = []
  apptOpen.value = false
  form.medicines = [{ medicine_id: null, medicine_label: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' }]
  medSearches.splice(0)
  nextTick(() => initMedSearch(0))
}

watch(() => props.show, (val) => {
  if (val) resetForm()
})

function error(key) {
  return errors[key] || ''
}
</script>

<template>
  <BaseDialog :show="show" title="New Prescription" size="lg" @close="emit('close')">
    <div class="space-y-6">
      <div v-if="error('general')" class="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
        <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ error('general') }}</p>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Appointment <span class="text-red-500">*</span></label>
        <div class="relative">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
            <input
              v-model="apptQuery"
              type="text"
              placeholder="Search for an appointment..."
              autocomplete="off"
              @input="onApptInput($event.target.value)"
              @focus="apptQuery.trim() && apptResults.length ? (apptOpen = true) : null"
              @blur="onApptBlur"
              @keydown="onApptKeydown"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
            />
            <div v-if="apptLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
              <svg class="w-4 h-4 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
          <div
            v-if="apptOpen && apptResults.length > 0"
            class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
          >
            <ul class="max-h-60 overflow-y-auto py-1">
              <li
                v-for="(item, index) in apptResults"
                :key="item.uuid"
                @mousedown.prevent="selectAppointment(item)"
                class="px-4 py-2.5 flex items-center gap-3 text-sm cursor-pointer transition"
                :class="index === apptHighlight ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                <div v-if="item.patient?.avatar" class="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img :src="item.patient.avatar" :alt="item.patient?.name || ''" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <span class="material-symbols-outlined text-sm text-slate-400">calendar_month</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold truncate">{{ item.label || '—' }}</p>
                  <p class="text-xs text-slate-400 truncate">{{ item.doctor?.name || '' }}</p>
                </div>
              </li>
            </ul>
          </div>
          <div
            v-if="apptOpen && apptQuery.trim() && !apptLoading && apptResults.length === 0"
            class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 text-center"
          >
            <p class="text-sm text-slate-500 dark:text-slate-400">No appointments found</p>
          </div>
        </div>
        <p v-if="error('appointment_id')" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ error('appointment_id') }}</p>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notes <span class="text-slate-400 font-normal">(optional)</span></label>
        <textarea v-model="form.notes" rows="3" placeholder="Add any notes or instructions..." class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition resize-none"></textarea>
      </div>

      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Medicines <span class="text-red-500">*</span></label>
          <button type="button" class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition" @click="addMedicine">
            <span class="material-symbols-outlined text-[16px]">add_circle</span>
            Add Medicine
          </button>
        </div>
        <p v-if="error('medicines')" class="mb-3 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ error('medicines') }}</p>

        <div v-for="(med, index) in form.medicines" :key="index" class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-4 mb-3">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Medicine #{{ index + 1 }}</span>
            <button v-if="form.medicines.length > 1" type="button" class="text-slate-400 hover:text-red-500 transition p-1" @click="removeMedicine(index)">
              <span class="material-symbols-outlined text-[18px]">remove_circle</span>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Medicine <span class="text-red-500">*</span></label>
              <div class="relative">
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[16px]">search</span>
                  <input
                    :value="medSearches[index]?.query || ''"
                    type="text"
                    placeholder="Search for a medicine..."
                    autocomplete="off"
                    @input="onMedInput($event.target.value, index)"
                    @focus="medSearches[index]?.query?.trim() && medSearches[index]?.results?.length ? (medSearches[index].open = true) : null"
                    @blur="onMedBlur(index)"
                    @keydown="onMedKeydown($event, index)"
                    class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
                  />
                  <div v-if="medSearches[index]?.loading" class="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg class="w-4 h-4 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                </div>
                <div
                  v-if="medSearches[index]?.open && medSearches[index]?.results?.length > 0"
                  class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <ul class="max-h-60 overflow-y-auto py-1">
                    <li
                      v-for="(item, i2) in medSearches[index].results"
                      :key="item.uuid || item.id"
                      @mousedown.prevent="selectMedicine(item, index)"
                      class="px-4 py-2.5 flex items-center gap-3 text-sm cursor-pointer transition"
                      :class="i2 === medSearches[index].highlightedIndex ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
                    >
                      <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        <img v-if="item.image_url" :src="item.image_url" :alt="item.name?.en || item.name || ''" class="w-full h-full object-cover" />
                        <span v-else class="material-symbols-outlined text-sm text-slate-400">medical_services</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold truncate">{{ item.name?.en || item.name || item.name_en || '—' }}</p>
                        <p v-if="item.description?.en || item.description" class="text-xs text-slate-400 truncate">{{ item.description?.en || item.description }}</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div
                  v-if="medSearches[index]?.open && medSearches[index]?.query?.trim() && !medSearches[index]?.loading && medSearches[index]?.results?.length === 0"
                  class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 text-center"
                >
                  <p class="text-sm text-slate-500 dark:text-slate-400">No medicines found</p>
                </div>
              </div>
              <p v-if="error(`medicines.${index}.medicine_id`)" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ error(`medicines.${index}.medicine_id`) }}</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Dosage <span class="text-red-500">*</span></label>
                <input v-model="med.dosage" type="text" placeholder="e.g. 500mg" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
                <p v-if="error(`medicines.${index}.dosage`)" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ error(`medicines.${index}.dosage`) }}</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Frequency</label>
                <input v-model="med.frequency" type="text" placeholder="e.g. twice daily" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Duration <span class="text-red-500">*</span></label>
                <input v-model="med.duration" type="text" placeholder="e.g. 7 days" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
                <p v-if="error(`medicines.${index}.duration`)" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ error(`medicines.${index}.duration`) }}</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Route</label>
                <select v-model="med.route" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
                  <option v-for="r in routeOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Instructions <span class="text-slate-400 font-normal">(optional)</span></label>
              <textarea v-model="med.instructions" rows="2" placeholder="e.g. Take with food" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition resize-none"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="emit('close')">Cancel</button>
      <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer" :disabled="saving" @click="handleSubmit">
        <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ saving ? 'Creating...' : 'Create Prescription' }}
      </button>
    </template>
  </BaseDialog>
</template>
