<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Recent Prescriptions</h3>
        <p class="text-sm text-slate-500">Latest prescriptions issued</p>
      </div>
      <button class="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" @click="$router.push('/facility/prescriptions')">View all</button>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else>
        <template v-if="recentPrescriptions.length">
          <ul class="space-y-2">
            <li v-for="rx in recentPrescriptions" :key="rx.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:shadow-md transition">
              <div class="flex items-center gap-3">
                <AvatarInitial :name="resolveTranslatedValue(rx.patientName)" size="sm" />
                <div>
                  <div class="font-semibold text-slate-900">{{ resolveTranslatedValue(rx.patientName) }}</div>
                  <div class="text-xs text-slate-500">{{ rx.medicines.length }} medicines • {{ rx.appointmentDate }}</div>
                </div>
              </div>
            </li>
          </ul>
        </template>

        <div v-else class="py-6 text-center text-sm text-slate-500">No prescriptions yet.</div>
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

const recentPrescriptions = computed(() => store.prescriptions.slice(0, 5))
</script>
