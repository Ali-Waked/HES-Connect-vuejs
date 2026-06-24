<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Recent Patients</h3>
        <p class="text-sm text-slate-500">Latest patient records</p>
      </div>
      <button class="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" @click="$router.push('/facility/patients')">View all</button>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else>
        <template v-if="recentPatients.length">
          <ul class="space-y-2">
            <li v-for="patient in recentPatients" :key="patient.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:shadow-md transition">
              <div class="flex items-center gap-3">
                <AvatarInitial :name="resolveTranslatedValue(patient.name)" size="sm" />
                <div>
                  <div class="font-semibold text-slate-900">{{ resolveTranslatedValue(patient.name) }}</div>
                  <div class="text-xs text-slate-500">{{ patient.totalAppointments }} visits</div>
                </div>
              </div>
              <div class="text-xs text-slate-500">Last: {{ patient.lastVisit }}</div>
            </li>
          </ul>
        </template>

        <div v-else class="py-6 text-center text-sm text-slate-500">No patients yet.</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

const recentPatients = computed(() => store.patients.slice(0, 5))
</script>
