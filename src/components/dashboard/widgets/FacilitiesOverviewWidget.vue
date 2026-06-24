<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Facilities Overview</h3>
        <p class="text-sm text-slate-500">All facilities in your organization</p>
      </div>
    </div>

    <div class="mt-4 space-y-3">
      <div v-if="facilities.length">
        <div v-for="fac in facilities" :key="fac.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:shadow-md transition">
          <div>
            <div class="font-semibold text-slate-900">{{ fac.name }}</div>
            <div class="text-xs text-slate-500">{{ fac.location }} • {{ fac.type }}</div>
          </div>
          <div class="flex items-center gap-4 text-sm text-slate-600">
            <span>{{ fac.staffCount }} staff</span>
            <span>{{ fac.appointmentCount }} appts</span>
          </div>
        </div>
      </div>
      <div v-else class="py-6 text-center text-sm text-slate-500">Loading facilities...</div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const facilities = ref([])

onMounted(() => {
  setTimeout(() => {
    facilities.value = [
      { id: 1, name: 'Al-Shifa Medical Complex', location: 'Gaza City', type: 'Hospital', staffCount: 48, appointmentCount: 156 },
      { id: 2, name: 'European Gaza Hospital', location: 'Khan Younis', type: 'Hospital', staffCount: 32, appointmentCount: 98 },
      { id: 3, name: 'Al-Awda Clinic', location: 'Jabalia', type: 'Clinic', staffCount: 12, appointmentCount: 45 }
    ]
  }, 400)
})
</script>
