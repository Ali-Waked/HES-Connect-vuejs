import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useDashboardStore } from './dashboard';
import * as reviewService from '@/services/reviewService';

export const useReviewsStore = defineStore('reviews', () => {
  const reviews = ref([]);
  const stats = ref({ total: 0, visible: 0, hidden: 0, average_rating: 0 });
  const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  let _lastParams = {};

  async function fetchReviews(params = {}) {
    loading.value = true;
    error.value = null;
    _lastParams = params;
    try {
      const { data } = await reviewService.getReviews(params);
      reviews.value = data.data || [];
      if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page || 1,
          last_page: data.meta.last_page || 1,
          total: data.meta.total || 0,
          per_page: data.meta.per_page || 15,
        };
      } else {
        pagination.value = { current_page: 1, last_page: 1, total: 0, per_page: 15 };
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load reviews';
      reviews.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    try {
      const { data } = await reviewService.getReviewStats();
      stats.value = {
        total: data.total || 0,
        visible: data.visible || data.approved || 0,
        hidden: data.hidden || 0,
        average_rating: data.average_rating ?? data.averageRating ?? 0,
      };
    } catch {
      stats.value = { total: 0, visible: 0, hidden: 0, average_rating: 0 };
    }
  }

  async function showReview(uuid) {
    actionLoading.value = true;
    try {
      await reviewService.showReview(uuid);
      const review = reviews.value.find(r => r.uuid === uuid || r.id === uuid);
      if (review) review.is_visible = true;
      useDashboardStore().addToast('Review is now visible', 'success');
      await fetchStats();
    } catch (err) {
      useDashboardStore().addToast(err.response?.data?.message || 'Failed to show review', 'error');
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function hideReview(uuid) {
    actionLoading.value = true;
    try {
      await reviewService.hideReview(uuid);
      const review = reviews.value.find(r => r.uuid === uuid || r.id === uuid);
      if (review) review.is_visible = false;
      useDashboardStore().addToast('Review is now hidden', 'success');
      await fetchStats();
    } catch (err) {
      useDashboardStore().addToast(err.response?.data?.message || 'Failed to hide review', 'error');
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function deleteReview(uuid) {
    actionLoading.value = true;
    try {
      await reviewService.deleteReview(uuid);
      reviews.value = reviews.value.filter(r => r.uuid !== uuid && r.id !== uuid);
      useDashboardStore().addToast('Review deleted successfully', 'success');
      await fetchStats();
    } catch (err) {
      useDashboardStore().addToast(err.response?.data?.message || 'Failed to delete review', 'error');
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  return {
    reviews,
    stats,
    pagination,
    loading,
    actionLoading,
    error,
    fetchReviews,
    fetchStats,
    showReview,
    hideReview,
    deleteReview,
  };
});
