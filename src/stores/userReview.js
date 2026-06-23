import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as reviewService from '@/services/public/reviewService';

export const useUserReviewStore = defineStore('userReview', () => {
  const review = ref(null);
  const hasReview = ref(false);
  const loading = ref(false);
  const submitting = ref(false);
  const error = ref(null);

  async function fetchMyReview() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await reviewService.getMyReview();
      review.value = data.data || data;
      hasReview.value = true;
    } catch (err) {
      if (err.response?.status === 404) {
        review.value = null;
        hasReview.value = false;
      } else {
        error.value = err.response?.data?.message || err.message || 'Failed to load review';
      }
    } finally {
      loading.value = false;
    }
  }

  async function submitReview(form) {
    submitting.value = true;
    error.value = null;
    try {
      let data;
      if (hasReview.value) {
        const res = await reviewService.updateReview(form);
        data = res.data;
      } else {
        const res = await reviewService.createReview(form);
        data = res.data;
      }
      review.value = data.data || data;
      hasReview.value = true;
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      submitting.value = false;
    }
  }

  function reset() {
    review.value = null;
    hasReview.value = false;
    loading.value = false;
    submitting.value = false;
    error.value = null;
  }

  return {
    review,
    hasReview,
    loading,
    submitting,
    error,
    fetchMyReview,
    submitReview,
    reset,
  };
});
