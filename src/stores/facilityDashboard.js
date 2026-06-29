import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getDashboard } from '@/services/facilityDashboardService';

export const useFacilityDashboardStore = defineStore('facilityDashboard', () => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const lastFetched = ref(null);

  const cards = computed(() => {
    const c = data.value?.cards;
    return Array.isArray(c) ? c.filter(x => x.title && x.value !== undefined) : [];
  });
  const charts = computed(() => {
    const c = data.value?.charts;
    return Array.isArray(c) ? c : [];
  });
  const recentData = computed(() => data.value?.recent_data ?? {});
  const growthPercentages = computed(() => data.value?.growth_percentages ?? {});
  const hasData = computed(() => data.value !== null);

  async function fetchDashboard() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const res = await getDashboard();
      data.value = res.data.data;
      lastFetched.value = Date.now();
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load dashboard';
    } finally {
      loading.value = false;
    }
  }

  function refreshDashboard() {
    data.value = null;
    return fetchDashboard();
  }

  return {
    data, loading, error, lastFetched,
    cards, charts, recentData, growthPercentages, hasData,
    fetchDashboard, refreshDashboard,
  };
});
