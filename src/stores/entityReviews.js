import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEntityReviewsStore = defineStore('entityReviews', () => {
  const reviews = ref([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const page = ref(1);
  const perPage = 5;

  const stats = ref({
    average: 4.5,
    total: 120,
    distribution: { 5: 80, 4: 25, 3: 10, 2: 3, 1: 2 }
  });

  const favorites = ref({
    count: 342,
    recent: [
      { id: 1, name: 'Khalid Abu Amr', avatar: null },
      { id: 2, name: 'Layla Ibrahim', avatar: null },
      { id: 3, name: 'Mohammed Al-Masri', avatar: null }
    ]
  });

  const fetchReviews = async (entityId, type) => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Dummy data generation
    const newReviews = Array.from({ length: perPage }).map((_, i) => ({
      id: (page.value - 1) * perPage + i + 1,
      patient_name: ['Ali Hamed', 'Sara Zaki', 'Omar Issa', 'Nour Salem', 'Hasan Ali'][Math.floor(Math.random() * 5)],
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      comment: 'The service was professional and the staff was very helpful during my visit.',
      created_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      appointment_id: `APT-${1000 + Math.floor(Math.random() * 9000)}`
    }));

    reviews.value.push(...newReviews);
    
    // Stop after 3 pages for simulation
    if (page.value >= 4) {
      hasMore.value = false;
    } else {
      page.value++;
    }
    
    loading.value = false;
  };

  const reset = () => {
    reviews.value = [];
    page.value = 1;
    hasMore.value = true;
    loading.value = false;
  };

  return {
    reviews,
    loading,
    hasMore,
    stats,
    favorites,
    fetchReviews,
    reset
  };
});
