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
import { useLocaleField } from '../../composables/useLocaleField';

const route = useRoute();
const router = useRouter();
const dashboardStore = useDashboardStore();
const reviewStore = useEntityReviewsStore();

const staffId = computed(() => parseInt(route.params.id));
const member = computed(() => dashboardStore.staff.find(s => s.id === staffId.value));

onMounted(() => {
  reviewStore.reset();
  reviewStore.fetchReviews(staffId.value, 'staff');
});

const { localField } = useLocaleField();

const loadMore = () => {
  reviewStore.fetchReviews(staffId.value, 'staff');
};

const goBack = () => router.push('/admin/staff');

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500'];
const avatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
const initial = (name) => name ? name.replace('Dr. ', '').charAt(0).toUpperCase() : '?';
</script>

<template>
  <div v-if="member" class="space-y-8 animate-fade-in">
    <!-- Profile Header -->
    <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div :class="`w-32 h-32 rounded-3xl ${avatarColor(localField(member, 'name'))} text-white text-4xl font-black flex items-center justify-center shadow-xl shadow-brand-primary/10 shrink-0`">
        {{ initial(localField(member, 'name')) }}
      </div>
      
      <div class="flex-grow text-center md:text-left space-y-4">
        <div class="space-y-1">
          <nav class="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            <button @click="goBack" class="hover:text-brand-primary transition">Staff</button>
            <span class="material-symbols-outlined text-[10px]">chevron_right</span>
            <span class="text-slate-600 dark:text-slate-400">Profile Detail</span>
          </nav>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ localField(member, 'name') }}</h1>
          <div class="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2">
            <BaseBadge variant="primary">{{ member.specialization }}</BaseBadge>
            <BaseBadge variant="neutral">{{ member.experience }} Years Experience</BaseBadge>
            <span class="inline-flex items-center gap-1.5 text-sm font-semibold" :class="member.status === 'Online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'">
              <span class="w-2 h-2 rounded-full" :class="member.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'"></span>
              {{ member.status }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap justify-center md:justify-start gap-6 py-4 border-t border-slate-50 dark:border-slate-800 mt-4">
          <div class="space-y-0.5">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center md:text-left">Email Address</p>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ member.email }}</p>
          </div>
          <div class="space-y-0.5">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center md:text-left">Consultation Fee</p>
            <p class="text-sm font-bold text-brand-primary">${{ member.fee }}/visit</p>
          </div>
          <div class="space-y-0.5">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center md:text-left">Auth Provider</p>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ member.provider }}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2 shrink-0 w-full md:w-auto">
        <button class="w-full px-6 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20">
          Book Appointment
        </button>
        <button class="w-full px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          Message Doctor
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard title="Avg Rating" :value="reviewStore.stats.average" icon="star" color="warning" />
      <StatisticsCard title="Total Reviews" :value="reviewStore.stats.total" icon="reviews" color="primary" />
      <StatisticsCard title="Appointments" value="2,150" icon="calendar_month" color="info" />
      <StatisticsCard title="Total Patients" value="842" icon="group" color="success" />
    </div>

    <!-- Reviews Section -->
    <div class="space-y-6">
      <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-brand-primary">verified_user</span>
        Patient Feedback
      </h3>
      <ReviewSummary :stats="reviewStore.stats" />

      <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
        <InfiniteScroll 
          :loading="reviewStore.loading" 
          :disabled="!reviewStore.hasMore"
          @load="loadMore"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviewCard 
              v-for="review in reviewStore.reviews" 
              :key="review.id" 
              :review="review"
              show-appointment
            />
          </div>
          
          <div v-if="!reviewStore.hasMore" class="py-12 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 mt-4">
            <span class="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl mb-2">done_all</span>
            <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">End of results</p>
          </div>
        </InfiniteScroll>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
