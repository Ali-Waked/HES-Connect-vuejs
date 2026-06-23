import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDashboardStore } from './dashboard';
import * as facilityService from '@/services/facilityService';
import { getFacilityReviews, showFacilityReview, hideFacilityReview } from '@/services/reviewService';

export const useFacilityDetailStore = defineStore('facilityDetail', () => {
  const facility = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const reviewStats = ref({ average_rating: 0, total_reviews: 0, rating_breakdown: {} });
  const reviewStatsLoading = ref(false);
  const reviewStatsError = ref(null);

  const reviews = ref([]);
  const reviewsLoading = ref(false);
  const reviewsError = ref(null);
  const reviewsPage = ref(1);
  const reviewsLastPage = ref(1);
  const reviewsTotal = ref(0);

  const departments = computed(() => facility.value?.departments || []);
  const children = computed(() => facility.value?.children || []);
  const images = computed(() => facility.value?.images || []);
  const files = computed(() => facility.value?.files || []);

  async function fetchFacility(id) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await facilityService.getFacilityShow(id);
      facility.value = data.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load facility';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchReviewStats(uuid) {
    reviewStatsLoading.value = true;
    reviewStatsError.value = null;
    try {
      const { data } = await facilityService.getFacilityReviewStats(uuid);
      reviewStats.value = {
        average_rating: data.data?.average_rating ?? 0,
        total_reviews: data.data?.total_reviews ?? 0,
        rating_breakdown: data.data?.rating_breakdown ?? {},
      };
    } catch (err) {
      reviewStatsError.value = err.response?.data?.message || 'Failed to load review statistics';
    } finally {
      reviewStatsLoading.value = false;
    }
  }

  async function fetchFacilityReviews(facilityUuid, append = false) {
    if (reviewsLoading.value) return;
    reviewsLoading.value = true;
    reviewsError.value = null;
    try {
      const page = append ? reviewsPage.value + 1 : 1;
      const { data } = await getFacilityReviews({ facility: facilityUuid, page });
      if (append) {
        reviews.value = [...reviews.value, ...(data.data || [])];
      } else {
        reviews.value = data.data || [];
      }
      reviewsPage.value = data.meta?.current_page || page;
      reviewsLastPage.value = data.meta?.last_page || 1;
      reviewsTotal.value = data.meta?.total || 0;
    } catch (err) {
      reviewsError.value = err.response?.data?.message || 'Failed to load reviews';
    } finally {
      reviewsLoading.value = false;
    }
  }

  async function toggleReviewVisibility(uuid, isActive) {
    try {
      if (isActive) {
        await showFacilityReview(uuid);
      } else {
        await hideFacilityReview(uuid);
      }
      const review = reviews.value.find(r => (r.uuid || r.id) === uuid);
      if (review) review.is_visible = isActive;
      useDashboardStore().addToast(
        isActive ? 'Review is now visible' : 'Review is now hidden',
        'success'
      );
    } catch (err) {
      useDashboardStore().addToast(
        err.response?.data?.message || 'Failed to update review',
        'error'
      );
      throw err;
    }
  }

  function resetReviews() {
    reviews.value = [];
    reviewsPage.value = 1;
    reviewsLastPage.value = 1;
    reviewsTotal.value = 0;
    reviewsError.value = null;
  }

  return {
    facility,
    loading,
    error,
    reviewStats,
    reviewStatsLoading,
    reviewStatsError,
    reviews,
    reviewsLoading,
    reviewsError,
    reviewsPage,
    reviewsLastPage,
    reviewsTotal,
    departments,
    children,
    images,
    files,
    fetchFacility,
    fetchReviewStats,
    fetchFacilityReviews,
    toggleReviewVisibility,
    resetReviews,
  };
});
