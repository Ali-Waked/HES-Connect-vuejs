<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFacilities } from '../composables/useFacilities'

const props = defineProps({
  facilityId: { type: [String, Number], default: null },
})

const emit = defineEmits(['save', 'close'])

const { t } = useI18n()
const { localField } = useLocaleField()
const facilities = useFacilities()

const visible = ref(false)
const saving = ref(false)
const form = ref({
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  type: 'hospital',
  email: '',
  phone: '',
  organization_id: '',
  city_id: '',
  status: 'pending',
  approval_status: 'pending',
  latitude: '',
  longitude: '',
  is_featured: false,
})

const typeOptions = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'radiology', label: 'Radiology Center' },
]

function show() {
  visible.value = true
  if (props.facilityId && facilities.currentFacility) {
    const f = facilities.currentFacility
    form.value = {
      name_en: f.name?.en || '',
      name_ar: f.name?.ar || '',
      description_en: f.description?.en || '',
      description_ar: f.description?.ar || '',
      type: f.facility_type || 'hospital',
      email: f.email || '',
      phone: f.phone || '',
      organization_id: f.organization_id || '',
      city_id: f.city_id || '',
      status: f.status || 'pending',
      approval_status: f.approval_status || 'pending',
      latitude: f.latitude || '',
      longitude: f.longitude || '',
      is_featured: f.is_featured || false,
    }
  } else {
    form.value = {
      name_en: '', name_ar: '', description_en: '', description_ar: '',
      type: 'hospital', email: '', phone: '', organization_id: '',
      city_id: '', status: 'pending', approval_status: 'pending',
      latitude: '', longitude: '', is_featured: false,
    }
  }
}

function hide() {
  visible.value = false
  emit('close')
}

async function submit() {
  saving.value = true
  try {
    await emit('save', { ...form.value })
    hide()
  } finally {
    saving.value = false
  }
}

defineExpose({ show, hide })
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="visible" class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" @click.self="hide">
        <div class="w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
          <div class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ facilityId ? 'Edit Facility' : 'New Facility' }}</h2>
            <button class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer" @click="hide">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Name (English) *</label>
                <input v-model="form.name_en" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="Facility name in English" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Name (Arabic) *</label>
                <input v-model="form.name_ar" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="اسم المنشأة بالعربية" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Type *</label>
              <select v-model="form.type" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition">
                <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                <input v-model="form.email" type="email" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="contact@facility.ps" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Phone</label>
                <input v-model="form.phone" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="+970 XX-XXX-XXXX" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
                <select v-model="form.status" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Approval Status</label>
                <select v-model="form.approval_status" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Latitude</label>
                <input v-model="form.latitude" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="31.5078" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Longitude</label>
                <input v-model="form.longitude" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="34.4697" />
              </div>
            </div>

            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input v-model="form.is_featured" type="checkbox" class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-primary focus:ring-brand-primary/30" />
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Featured</span>
              </label>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description (English)</label>
              <textarea v-model="form.description_en" rows="3" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition resize-none" placeholder="Facility description in English"></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description (Arabic)</label>
              <textarea v-model="form.description_ar" rows="3" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition resize-none" placeholder="وصف المنشأة بالعربية"></textarea>
            </div>

            <div v-if="facilities.validationErrors.value && Object.keys(facilities.validationErrors.value).length" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p v-for="(msg, field) in facilities.validationErrors.value" :key="field" class="text-xs text-red-600 dark:text-red-400">{{ field }}: {{ msg }}</p>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3">
            <button class="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer" @click="hide">Cancel</button>
            <button
              class="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              :disabled="saving"
              @click="submit"
            >
              <svg v-if="saving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ facilityId ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
}
.slide-enter-from > div, .slide-leave-to > div {
  transform: translateX(100%);
}
</style>
