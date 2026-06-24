<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStaffDetailStore } from '../../stores/useStaffDetailStore'
import { useEntityReviewsStore } from '../../stores/entityReviews'
import StaffHeaderCard from '../../components/dashboard/StaffDetail/StaffHeaderCard.vue'
import StaffInfoTable from '../../components/dashboard/StaffDetail/StaffInfoTable.vue'
import FacilityCard from '../../components/dashboard/StaffDetail/FacilityCard.vue'
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue'
import ReviewSummary from '../../components/dashboard/global/ReviewSummary.vue'
import ReviewCard from '../../components/dashboard/global/ReviewCard.vue'
import InfiniteScroll from '../../components/dashboard/global/InfiniteScroll.vue'
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue'
import LoadingSkeleton from '../../components/dashboard/global/LoadingSkeleton.vue'
import { useLocaleField } from '../../composables/useLocaleField'
import { resolveTranslatedValue } from '../../utils/locale'

const route = useRoute()
const router = useRouter()
const detailStore = useStaffDetailStore()
const reviewStore = useEntityReviewsStore()
const { localField } = useLocaleField()

const uuid = computed(() => route.params.uuid)

onMounted(() => {
  if (uuid.value) {
    detailStore.fetchStaff(uuid.value)
    reviewStore.reset()
  }
})

watch(uuid, (val) => {
  if (val) {
    detailStore.fetchStaff(val)
    reviewStore.reset()
  }
})

const loadMore = () => {
  reviewStore.fetchReviews(parseInt(uuid.value), 'staff')
}

const goBack = () => router.push('/platform/staff')

const facilitiesCount = computed(() => detailStore.staff?.facilities?.length || 0)
const departmentsCount = computed(() => {
  const depts = new Set()
  detailStore.staff?.facilities?.forEach(f => {
    if (f.department?.uuid) depts.add(f.department.uuid)
  })
  return depts.size || 0
})

const emptyFacilities = computed(() => !detailStore.staff?.facilities?.length)
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Loading -->
    <div v-if="detailStore.loading && !detailStore.staff" class="space-y-6">
      <LoadingSkeleton card avatar :lines="4" :widths="['70%', '90%', '50%', '80%']" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingSkeleton v-for="n in 4" :key="n" card :lines="2" :widths="['50%', '80%']" height="12px" />
      </div>
      <LoadingSkeleton card :lines="7" :widths="['30%', '60%', '30%', '60%', '30%', '60%', '30%']" height="16px" />
    </div>

    <!-- Error -->
    <div v-else-if="detailStore.error && !detailStore.staff" class="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div class="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
        <svg class="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">Failed to Load Staff</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md">{{ detailStore.error }}</p>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="detailStore.fetchStaff(uuid)"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/>
        </svg>
        Retry
      </button>
    </div>

    <!-- Loaded -->
    <template v-else-if="detailStore.staff">
      <!-- Re-fetching overlay -->
      <div v-if="detailStore.loading" class="flex items-center gap-2 p-3 mb-2 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary text-xs font-semibold">
        <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        Updating...
      </div>

      <StaffHeaderCard :staff="detailStore.staff" @back="goBack" />

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Experience"
          :value="detailStore.staff.experience_years != null ? `${detailStore.staff.experience_years} Years` : '—'"
          icon="calendar_month"
          color="primary"
        />
        <StatisticsCard
          title="Consultation Fee"
          :value="detailStore.staff.consultation_fee != null ? `$${detailStore.staff.consultation_fee}` : '—'"
          icon="payments"
          color="warning"
        />
        <StatisticsCard
          title="Active Facilities"
          :value="facilitiesCount"
          icon="local_hospital"
          color="info"
        />
        <StatisticsCard
          title="Departments"
          :value="departmentsCount"
          icon="category"
          color="success"
        />
      </div>

      <!-- Personal Information + Specialization & Bio -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <StaffInfoTable :user="detailStore.staff.user" />
        </div>

        <!-- Specialization & Bio sidebar -->
        <div class="space-y-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>
                </svg>
                Specialization & Bio
              </h3>
            </div>
            <div class="p-6 space-y-5">
              <div>
                <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Specialization</label>
                <p v-if="detailStore.staff.specialization" class="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {{ localField(detailStore.staff, 'specialization') }}
                </p>
                <p v-else class="mt-1.5 text-sm text-slate-400">—</p>
              </div>
              <div v-if="detailStore.staff.specialization" class="flex gap-2">
                <BaseBadge v-if="resolveTranslatedValue(detailStore.staff.specialization, 'en')" variant="neutral">
                  EN: {{ resolveTranslatedValue(detailStore.staff.specialization, 'en') }}
                </BaseBadge>
                <BaseBadge v-if="resolveTranslatedValue(detailStore.staff.specialization, 'ar')" variant="neutral">
                  AR: {{ resolveTranslatedValue(detailStore.staff.specialization, 'ar') }}
                </BaseBadge>
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bio</label>
                <p class="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {{ localField(detailStore.staff, 'bio') || '—' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Status Card -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
                Account Status
              </h3>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Provider</span>
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ detailStore.staff.user?.provider || 'Email' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Last Seen</span>
                <span class="text-sm text-slate-600 dark:text-slate-400">{{ detailStore.staff.user?.last_seen_at || '—' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Staff Since</span>
                <span class="text-sm text-slate-600 dark:text-slate-400">{{ detailStore.staff.created_at || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Facilities Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
            </svg>
            Facilities ({{ facilitiesCount }})
          </h3>
        </div>

        <!-- Empty Facilities -->
        <div v-if="emptyFacilities" class="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 gap-3">
          <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">No facilities assigned</p>
        </div>

        <!-- Facility Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FacilityCard v-for="facility in detailStore.staff.facilities" :key="facility.uuid" :facility="facility" />
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="space-y-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
          </svg>
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
              <svg class="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">End of results</p>
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
