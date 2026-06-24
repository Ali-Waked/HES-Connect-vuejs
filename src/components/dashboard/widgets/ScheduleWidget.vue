<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Upcoming Unavailable Dates</h3>
        <p class="text-sm text-slate-500">Planned leaves and blocks</p>
      </div>
      <button class="rounded-md border border-slate-200 px-3 py-2 text-sm" @click="$router.push('/facility/schedule')">Manage Schedule</button>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-10 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-10 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else>
        <ul class="space-y-2">
          <li v-for="d in upcomingDates" :key="d.id" class="flex items-center justify-between rounded-md p-2 hover:bg-slate-50 transition">
            <div>
              <div class="font-semibold text-slate-900">{{ d.date }}</div>
              <div class="text-xs text-slate-500">{{ resolveTranslatedValue(d.reason) }}</div>
            </div>
          </li>
        </ul>
        <div v-if="!upcomingDates.length" class="text-sm text-slate-500 mt-3">No upcoming unavailable dates.</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

const upcomingDates = computed(() => store.unavailableDates.filter(d => new Date(d.date) >= new Date()).slice(0, 5))
</script>
