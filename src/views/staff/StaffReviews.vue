<template>
  <div class="animate-fade-in space-y-6">
    <div>
      <h2 class="text-xl font-bold text-slate-900">Reviews</h2>
      <p class="text-sm text-slate-500">Patient feedback and ratings</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-32 w-full animate-pulse rounded-xl bg-slate-100"></div>
      <div class="h-48 w-full animate-pulse rounded-xl bg-slate-100"></div>
    </div>

    <template v-else>
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center gap-6">
          <div class="text-center">
            <div class="text-5xl font-bold text-slate-900">{{ avg }}</div>
            <div class="mt-1 text-2xl text-amber-500">{{ fullStars }}</div>
            <p class="mt-1 text-sm text-slate-500">Based on {{ store.reviews.length }} reviews</p>
          </div>
          <div class="flex-1 space-y-2">
            <div v-for="star in 5" :key="star" class="flex items-center gap-2 text-sm">
              <span class="w-6 text-slate-600">{{ 6 - star }}★</span>
              <div class="flex-1 h-2 rounded-full bg-slate-100">
                <div class="h-2 rounded-full bg-amber-400" :style="{ width: breakdown[5 - star] + '%' }"></div>
              </div>
              <span class="w-8 text-slate-500 text-xs">{{ breakdown[5 - star] }}%</span>
            </div>
          </div>
        </div>
      </section>

      <DataTable :columns="columns" :items="store.reviews" empty-title="No reviews yet">
        <template #cell-rating="{ item }">
          <span class="text-amber-500 font-bold">{{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}</span>
        </template>
      </DataTable>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import DataTable from '@/components/staff/shared/DataTable.vue'

const store = useStaffStore()
const loading = ref(true)

const columns = [
  { key: 'patientName', label: 'Patient' },
  { key: 'appointmentDate', label: 'Appointment Date' },
  { key: 'rating', label: 'Rating' },
  { key: 'comment', label: 'Comment' },
  { key: 'date', label: 'Date' }
]

const avg = computed(() => (store.avgRating || 0).toFixed(1))
const fullStars = computed(() => '★'.repeat(Math.round(store.avgRating || 0)) + '☆'.repeat(5 - Math.round(store.avgRating || 0)))

const breakdown = computed(() => {
  const counts = [0, 0, 0, 0, 0]
  const total = store.reviews.length || 1
  store.reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[5 - r.rating]++ })
  return counts.map(c => Math.round(c / total * 100))
})

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
