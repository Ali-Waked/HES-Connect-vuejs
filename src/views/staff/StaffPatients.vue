<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900">My Patients</h2>
        <p class="text-sm text-slate-500">Patient records and history</p>
      </div>
      <input v-model="search" placeholder="Search by name or email..." class="rounded-lg border border-slate-200 px-3 py-2 text-sm w-64" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-36 animate-pulse rounded-xl bg-slate-100"></div>
    </div>

    <template v-else>
      <div v-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="patient in filtered" :key="patient.id" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div class="flex items-center gap-3">
            <AvatarInitial :name="resolveTranslatedValue(patient.name)" />
            <div class="min-w-0 flex-1">
              <p class="font-bold text-slate-900 truncate">{{ resolveTranslatedValue(patient.name) }}</p>
              <p class="text-xs text-slate-500 truncate">{{ patient.email }}</p>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-sm">
            <span class="text-slate-500">Last visit: {{ patient.lastVisit }}</span>
            <span class="rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-bold text-brand-primary">{{ patient.totalAppointments }} appts</span>
          </div>
          <button class="mt-3 w-full rounded-md border border-slate-200 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" @click="openDetail(patient.id)">View Details</button>
        </div>
      </div>
      <div v-else class="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300">group_off</span>
        <p class="mt-2 text-sm font-bold text-slate-900">No patients found</p>
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
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)
const search = ref('')
const detailModal = ref(false)
const selectedId = ref(null)

const filtered = computed(() => {
  if (!search.value) return store.patients
  const q = search.value.toLowerCase()
  return store.patients.filter(p => resolveTranslatedValue(p.name).toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
})

function openDetail(id) { selectedId.value = id; detailModal.value = true }

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
