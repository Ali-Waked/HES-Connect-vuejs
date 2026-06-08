<script setup>
import { useReviewsStore } from '../../stores/reviews';
import BaseStatsCard from '../../components/dashboard/global/BaseStatsCard.vue';
import ReviewsTable from '../../components/dashboard/Reviews/ReviewsTable.vue';

const store = useReviewsStore();
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Platform Reviews</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Manage user feedback and ratings</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseStatsCard title="Total Reviews" :value="store.stats.total" color="primary">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 001.902 0l1.519-4.674c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </template>
      </BaseStatsCard>
      <BaseStatsCard title="Approved Reviews" :value="store.stats.approved" color="success">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A3.333 3.333 0 0118 6.31V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2.31a3.333 3.333 0 01-1.618 2.874L2 11.5v1.25a3.333 3.333 0 011.618 2.874V18a2 2 0 002 2h8a2 2 0 002-2v-2.31a3.333 3.333 0 011.618-2.874L22 12.75V11.5l-2.382-2.266z" />
          </svg>
        </template>
      </BaseStatsCard>
      <BaseStatsCard title="Hidden Reviews" :value="store.stats.hidden" color="danger">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
          </svg>
        </template>
      </BaseStatsCard>
      <BaseStatsCard title="Average Rating" :value="store.stats.averageRating" color="warning">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </template>
      </BaseStatsCard>
    </div>

    <ReviewsTable />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
