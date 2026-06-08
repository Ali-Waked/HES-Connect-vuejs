<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">My Patients</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Patient records and history</p>
      </div>
      <input v-model="search" placeholder="Search by name or email..." class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm w-64" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700"></div>
    </div>

    <template v-else>
      <div v-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="patient in filtered" :key="patient.id" class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition hover:shadow-md">
          <div class="flex items-center gap-3">
            <AvatarInitial :name="patient.name" />
            <div class="min-w-0 flex-1">
              <p class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ patient.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ patient.email }}</p>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Last visit: {{ patient.lastVisit }}</span>
            <span class="rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-bold text-brand-primary">{{ patient.totalAppointments }} appts</span>
          </div>
          <button class="mt-3 w-full rounded-md border border-slate-200 dark:border-slate-700 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700" @click="openDetail(patient.id)">View Details</button>
        </div>
      </div>
      <div v-else class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-500">group_off</span>
        <p class="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">No patients found</p>
      </div>
    </template>

    <PatientDetailModal :show="detailModal" :patient-id="selectedId" @close="detailModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import PatientDetailModal from '@/components/staff/modals/PatientDetailModal.vue'

const store = useStaffStore()
const loading = ref(true)
const search = ref('')
const detailModal = ref(false)
const selectedId = ref(null)

const filtered = computed(() => {
  if (!search.value) return store.patients
  const q = search.value.toLowerCase()
  return store.patients.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
})

function openDetail(id) { selectedId.value = id; detailModal.value = true }

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
