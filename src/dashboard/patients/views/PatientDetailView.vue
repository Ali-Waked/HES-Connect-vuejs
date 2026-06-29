<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFormatDate } from '@/composables/useFormatDate'
import { usePatients } from '../composables/usePatients'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { localField } = useLocaleField()
const { formatDate } = useFormatDate()
const patients = usePatients()

const patientId = computed(() => route.params.id)

const tabs = ref([
  { key: 'overview', label: 'Overview' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'history', label: 'Medical History' },
])

const activeTab = ref('overview')

onMounted(async () => {
  await patients.loadItem(patientId.value)
})
</script>

<template>
  <div>
    <PageHeader :title="localField(patients.currentPatient?.name) || 'Patient Details'" back-to="/dashboard/patients" />

    <div v-if="patients.loading.value" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse"></div>
    </div>

    <EmptyState v-else-if="patients.error.value" title="Failed to load patient" :description="patients.error.value" icon="error" />

    <template v-else-if="patients.currentPatient">
      <!-- Tabs -->
      <div class="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer"
          :class="activeTab === tab.key ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Overview -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Personal Information</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ localField(patients.currentPatient.name) || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Gender</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ patients.currentPatient.gender || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Date of Birth</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ formatDate(patients.currentPatient.date_of_birth) || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ patients.currentPatient.phone || '—' }}</dd>
              </div>
              <div class="col-span-2">
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Email</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ patients.currentPatient.email || '—' }}</dd>
              </div>
              <div class="col-span-2">
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Address</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ localField(patients.currentPatient.address) || '—' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Status</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="patients.currentPatient.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'">
                  {{ patients.currentPatient.status || 'inactive' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Total Appointments</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ patients.currentPatient.appointments_count || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Total Prescriptions</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ patients.currentPatient.prescriptions_count || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Last Visit</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ formatDate(patients.currentPatient.last_visit) || '—' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Emergency Contact</h3>
            <div class="space-y-2">
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ localField(patients.currentPatient.emergency_contact?.name) || 'No emergency contact on file' }}</p>
              <p v-if="patients.currentPatient.emergency_contact?.phone" class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ patients.currentPatient.emergency_contact.phone }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Appointments -->
      <div v-if="activeTab === 'appointments'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">Appointment history will be displayed here.</p>
      </div>

      <!-- Prescriptions -->
      <div v-if="activeTab === 'prescriptions'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">Prescription history will be displayed here.</p>
      </div>

      <!-- Medical History -->
      <div v-if="activeTab === 'history'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">Medical history will be displayed here.</p>
      </div>
    </template>
  </div>
</template>
