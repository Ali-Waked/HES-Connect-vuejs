<script setup>
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useFacilityDetailStore } from '../../stores/facilityDetail';
import FacilityHeader from '../../components/dashboard/FacilityDetail/FacilityHeader.vue';
import FacilityStatsCards from '../../components/dashboard/FacilityDetail/FacilityStatsCards.vue';
import FacilityInfoSection from '../../components/dashboard/FacilityDetail/FacilityInfoSection.vue';
import FacilityDepartments from '../../components/dashboard/FacilityDetail/FacilityDepartments.vue';
import FacilityChildFacilities from '../../components/dashboard/FacilityDetail/FacilityChildFacilities.vue';
import FacilityGallery from '../../components/dashboard/FacilityDetail/FacilityGallery.vue';
import FacilityDocuments from '../../components/dashboard/FacilityDetail/FacilityDocuments.vue';
import FacilityReviewSummary from '../../components/dashboard/FacilityDetail/FacilityReviewSummary.vue';
import FacilityReviewsSection from '../../components/dashboard/FacilityDetail/FacilityReviewsSection.vue';
import LoadingSkeleton from '../../components/dashboard/global/LoadingSkeleton.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const store = useFacilityDetailStore();

const goBack = () => router.push('/admin/facilities');

onMounted(async () => {
  const uuid = route.params.id;
  try {
    await Promise.all([
      store.fetchFacility(uuid),
      store.fetchReviewStats(uuid),
    ]);
  } catch {
    router.push('/admin/facilities');
  }
});

watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    store.resetReviews();
    try {
      await Promise.all([
        store.fetchFacility(newId),
        store.fetchReviewStats(newId),
      ]);
    } catch {
      router.push('/admin/facilities');
    }
  }
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div v-if="store.loading && !store.facility" class="space-y-6">
      <LoadingSkeleton card :lines="2" :widths="['70%', '40%']" height="18px" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingSkeleton v-for="n in 4" :key="n" card :lines="2" :widths="['50%', '80%']" height="12px" />
      </div>
      <LoadingSkeleton card :lines="4" :widths="['30%', '60%', '30%', '60%']" height="14px" />
    </div>

    <div v-else-if="store.error && !store.facility" class="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div class="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('facilityDetail.notFoundTitle') || 'Failed to Load Facility' }}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md">{{ store.error }}</p>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="store.fetchFacility(route.params.id)"
      >
        {{ t('reviews.retry') || 'Retry' }}
      </button>
    </div>

    <template v-else-if="store.facility">
      <FacilityHeader :facility="store.facility" @back="goBack" />

      <FacilityStatsCards
        :departments-count="store.departments.length"
        :children-count="store.children.length"
        :images-count="store.images.length"
        :documents-count="store.files.length"
      />

      <FacilityInfoSection :facility="store.facility" />

      <FacilityDepartments :departments="store.departments" />

      <FacilityGallery :images="store.images" :cover-image="store.facility.cover_image" />

      <FacilityDocuments :files="store.files" />

      <FacilityChildFacilities :children="store.children" />

      <FacilityReviewSummary
        :average-rating="store.reviewStats.average_rating"
        :total-reviews="store.reviewStats.total_reviews"
        :rating-breakdown="store.reviewStats.rating_breakdown"
        :loading="store.reviewStatsLoading"
        :error="store.reviewStatsError"
        @retry="store.fetchReviewStats(store.facility.uuid)"
      />

      <FacilityReviewsSection :facility-uuid="store.facility.uuid" />
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
