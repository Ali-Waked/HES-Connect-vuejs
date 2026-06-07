<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDashboardStore } from '../../stores/dashboard';
import { useEntityReviewsStore } from '../../stores/entityReviews';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import ReviewSummary from '../../components/dashboard/global/ReviewSummary.vue';
import ReviewCard from '../../components/dashboard/global/ReviewCard.vue';
import InfiniteScroll from '../../components/dashboard/global/InfiniteScroll.vue';
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue';

const route = useRoute();
const router = useRouter();
const dashboardStore = useDashboardStore();
const reviewStore = useEntityReviewsStore();

const facilityId = computed(() => parseInt(route.params.id));
const facility = computed(() => dashboardStore.facilities.find(f => f.id === facilityId.value));

onMounted(() => {
  reviewStore.reset();
  reviewStore.fetchReviews(facilityId.value, 'facility');
});

const loadMore = () => {
  reviewStore.fetchReviews(facilityId.value, 'facility');
};

const goBack = () => router.push('/admin/facilities');
</script>

<template>
  <div v-if="facility" class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="space-y-1">
        <nav class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
          <button @click="goBack" class="hover:text-brand-primary transition">Facilities</button>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <span class="text-slate-600">{{ facility.name }}</span>
        </nav>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">{{ facility.name }}</h1>
        <div class="flex items-center gap-3">
          <BaseBadge variant="primary">{{ facility.type }}</BaseBadge>
          <span class="text-sm font-medium text-slate-500 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">corporate_fare</span>
            {{ facility.organization }}
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">edit</span>
          Edit Facility
        </button>
        <button class="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/10">
          <span class="material-symbols-outlined text-lg">share</span>
          Share
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatisticsCard title="Total Patients" value="1,240" icon="group" color="primary" />
      <StatisticsCard title="Total Staff" value="48" icon="medical_information" color="info" />
      <StatisticsCard title="Favorites" :value="reviewStore.favorites.count" icon="favorite" color="danger" />
      <StatisticsCard title="Avg Rating" :value="reviewStore.stats.average" icon="star" color="warning" />
      <StatisticsCard title="Reviews" :value="reviewStore.stats.total" icon="reviews" color="success" />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-72 flex flex-col">
        <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-primary text-lg">trending_up</span>
          Reviews Trend (6 Months)
        </h3>
        <div class="flex-grow bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
          <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Growth Analytics Placeholder</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-72 flex flex-col">
        <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-primary text-lg">event_note</span>
          Appointments Volume
        </h3>
        <div class="flex-grow bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
          <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Operational Throughput Placeholder</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Reviews -->
      <div class="lg:col-span-2 space-y-6">
        <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-primary">rate_review</span>
          Patient Reviews
        </h3>
        
        <ReviewSummary :stats="reviewStore.stats" />

        <div class="pt-4 border-t border-slate-100">
          <InfiniteScroll 
            :loading="reviewStore.loading" 
            :disabled="!reviewStore.hasMore"
            @load="loadMore"
          >
            <div class="grid grid-cols-1 gap-4">
              <ReviewCard 
                v-for="review in reviewStore.reviews" 
                :key="review.id" 
                :review="review"
              />
            </div>
            
            <div v-if="!reviewStore.hasMore" class="py-8 text-center">
              <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">No more reviews to show</p>
            </div>
          </InfiniteScroll>
        </div>
      </div>

      <!-- Right Column: Info & Favorites -->
      <div class="space-y-6">
        <!-- Facility Info Card -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 class="text-lg font-bold text-slate-900">Facility Information</h3>
          
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                <span class="material-symbols-outlined text-lg">location_on</span>
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coordinates</p>
                <p class="text-sm font-semibold text-slate-700">{{ facility.location || 'Not provided' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                <span class="material-symbols-outlined text-lg">account_tree</span>
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent Facility</p>
                <p class="text-sm font-semibold text-slate-700">{{ facility.parent || 'Main Facility' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Favorites -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900">Recent Favorites</h3>
            <span class="text-xs font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{{ reviewStore.favorites.count }}</span>
          </div>
          
          <div class="space-y-4">
            <div v-for="user in reviewStore.favorites.recent" :key="user.id" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                {{ user.name.charAt(0) }}
              </div>
              <span class="text-sm font-semibold text-slate-700">{{ user.name }}</span>
            </div>
            <button class="w-full py-2 text-xs font-bold text-slate-400 hover:text-brand-primary transition uppercase tracking-widest">View all users</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Loading State -->
  <div v-else class="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
    <div class="w-12 h-12 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
    <p class="font-medium uppercase tracking-widest text-xs">Loading facility details...</p>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
