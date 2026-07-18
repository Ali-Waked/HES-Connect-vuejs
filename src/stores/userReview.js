import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as reviewService from '@/services/public/reviewService';

export const useUserReviewStore = defineStore('userReview', () => {
  const review = ref(null);
  const hasReview = ref(false);
  const canReview = ref(false);
  const canReviewReason = ref('');
  const loading = ref(false);
  const submitting = ref(false);
  const error = ref(null);

  async function fetchMyReview() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await reviewService.getMyReview();
      const payload = data.data || data;
      canReview.value = payload.can_review ?? false;
      canReviewReason.value = payload.reason || '';
      hasReview.value = payload.has_review ?? false;
      review.value = payload.review || null;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        canReview.value = false;
        canReviewReason.value = '';
        hasReview.value = false;
        review.value = null;
      } else if (err.response?.status === 404) {
        canReview.value = false;
        hasReview.value = false;
        review.value = null;
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
      const payload = data.data || data;
      review.value = payload.review || payload;
      hasReview.value = true;
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review';
      error.value = msg;
      return { success: false, error: msg, errors: err.response?.data?.errors || {} };
    } finally {
      submitting.value = false;
    }
  }

  async function deleteReview() {
    submitting.value = true;
    error.value = null;
    try {
      await reviewService.deleteReview();
      review.value = null;
      hasReview.value = false;
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete review';
      return { success: false, error: msg };
    } finally {
      submitting.value = false;
    }
  }

  function reset() {
    review.value = null;
    hasReview.value = false;
    canReview.value = false;
    canReviewReason.value = '';
    loading.value = false;
    submitting.value = false;
    error.value = null;
  }

  return {
    review,
    hasReview,
    canReview,
    canReviewReason,
    loading,
    submitting,
    error,
    fetchMyReview,
    submitReview,
    deleteReview,
    reset,
  };
});
