import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useReviewsStore = defineStore('reviews', () => {
  const reviews = ref([
    { id: 1, user: 'John Doe', rating: 5, comment: 'Excellent platform, very helpful!', status: 'approved', created_at: '2026-06-01T10:00:00Z' },
    { id: 2, user: 'Jane Smith', rating: 4, comment: 'Good service, but could be faster.', status: 'approved', created_at: '2026-06-02T11:30:00Z' },
    { id: 3, user: 'Robert Brown', rating: 2, comment: 'Not what I expected.', status: 'hidden', created_at: '2026-06-03T09:15:00Z' },
    { id: 4, user: 'Alice Wilson', rating: 5, comment: 'Life saving application!', status: 'approved', created_at: '2026-06-05T14:45:00Z' },
    { id: 5, user: 'Charlie Davis', rating: 3, comment: 'Average experience.', status: 'pending', created_at: '2026-06-06T16:20:00Z' }
  ]);

  const stats = computed(() => {
    const approved = reviews.value.filter(r => r.status === 'approved');
    const avgRating = approved.length > 0 
      ? approved.reduce((acc, curr) => acc + curr.rating, 0) / approved.length 
      : 0;

    return {
      total: reviews.value.length,
      approved: approved.length,
      hidden: reviews.value.filter(r => r.status === 'hidden').length,
      averageRating: avgRating.toFixed(1)
    };
  });

  const approveReview = (id) => {
    const review = reviews.value.find(r => r.id === id);
    if (review) review.status = 'approved';
  };

  const hideReview = (id) => {
    const review = reviews.value.find(r => r.id === id);
    if (review) review.status = 'hidden';
  };

  const deleteReview = (id) => {
    reviews.value = reviews.value.filter(r => r.id !== id);
  };

  return {
    reviews,
    stats,
    approveReview,
    hideReview,
    deleteReview
  };
});
