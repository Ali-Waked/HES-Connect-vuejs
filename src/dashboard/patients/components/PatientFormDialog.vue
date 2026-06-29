<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePatients } from '../composables/usePatients'

const props = defineProps({
  patientId: { type: [String, Number], default: null },
})

const emit = defineEmits(['save', 'close'])

const { t } = useI18n()
const patients = usePatients()

const visible = ref(false)
const saving = ref(false)
const form = ref({
  name_en: '',
  name_ar: '',
  email: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  address_en: '',
  address_ar: '',
  status: 'active',
})

function show() {
  visible.value = true
  if (props.patientId && patients.currentPatient) {
    const p = patients.currentPatient
    form.value = {
      name_en: p.name?.en || '',
      name_ar: p.name?.ar || '',
      email: p.email || '',
      phone: p.phone || '',
      gender: p.gender || '',
      date_of_birth: p.date_of_birth || '',
      address_en: p.address?.en || '',
      address_ar: p.address?.ar || '',
      status: p.status || 'active',
    }
  } else {
    form.value = { name_en: '', name_ar: '', email: '', phone: '', gender: '', date_of_birth: '', address_en: '', address_ar: '', status: 'active' }
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
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ patientId ? 'Edit Patient' : 'Add Patient' }}</h2>
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
                <input v-model="form.name_en" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="Full name in English" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Name (Arabic)</label>
                <input v-model="form.name_ar" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="الاسم الكامل بالعربية" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                <input v-model="form.email" type="email" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="patient@email.com" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Phone</label>
                <input v-model="form.phone" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="+970 XX-XXX-XXXX" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Gender</label>
                <select v-model="form.gender" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Date of Birth</label>
                <input v-model="form.date_of_birth" type="date" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
              <select v-model="form.status" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Address (English)</label>
              <input v-model="form.address_en" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="Address in English" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Address (Arabic)</label>
              <input v-model="form.address_ar" type="text" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" placeholder="العنوان بالعربية" />
            </div>

            <div v-if="patients.validationErrors.value && Object.keys(patients.validationErrors.value).length" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p v-for="(msg, field) in patients.validationErrors.value" :key="field" class="text-xs text-red-600 dark:text-red-400">{{ field }}: {{ msg }}</p>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3">
            <button class="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer" @click="hide">Cancel</button>
            <button class="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50" :disabled="saving" @click="submit">
              <svg v-if="saving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ patientId ? 'Update' : 'Create' }}
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
