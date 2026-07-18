import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchDashboardData } from '@/services/dashboardApiService';

const cardMeta = {
  total_users: { icon: 'person', color: 'info', title: 'Users' },
  total_facilities: { icon: 'home_health', color: 'warning', title: 'Facilities' },
  total_departments: { icon: 'business', color: 'primary', title: 'Departments' },
  total_categories: { icon: 'category', color: 'neutral', title: 'Categories' },
  total_articles: { icon: 'article', color: 'primary', title: 'Articles' },
  total_stories: { icon: 'auto_stories', color: 'success', title: 'Stories' },
  total_job_posts: { icon: 'work', color: 'warning', title: 'Job Posts' },
  total_staff: { icon: 'badge', color: 'info', title: 'Staff' },
  total_doctors: { icon: 'stethoscope', color: 'success', title: 'Doctors' },
  total_patients: { icon: 'group', color: 'danger', title: 'Patients' },
  total_donations: { icon: 'volunteer_activism', color: 'danger', title: 'Donations' },
  total_appointments: { icon: 'calendar_month', color: 'info', title: 'Appointments' },
};

const growthKeyMap = {
  total_users: 'users_growth',
  total_facilities: 'facilities_growth',
  total_departments: 'departments_growth',
  total_categories: 'categories_growth',
  total_articles: 'articles_growth',
  total_stories: 'stories_growth',
  total_job_posts: 'job_posts_growth',
  total_staff: 'staff_growth',
  total_doctors: 'doctors_growth',
  total_patients: 'patients_growth',
  total_donations: 'donations_growth',
  total_appointments: 'appointments_growth',
};

const chartDefs = {
  users_growth: { title: 'Users Growth', type: 'line', valueKey: 'value' },
  facilities_growth: { title: 'Facilities Growth', type: 'bar', valueKey: 'value' },
  articles_per_month: { title: 'Articles per Month', type: 'bar', valueKey: 'value' },
  stories_per_month: { title: 'Stories per Month', type: 'bar', valueKey: 'value' },
  appointments_per_month: { title: 'Appointments per Month', type: 'line', valueKey: 'value' },
  job_posts_per_month: { title: 'Job Posts per Month', type: 'bar', valueKey: 'value' },
  donations_per_month: { title: 'Donations per Month', type: 'line', valueKey: 'value' },
  top_categories: { title: 'Top Categories', type: 'doughnut', valueKey: 'count', nameKey: 'name' },
  top_departments: { title: 'Top Departments', type: 'bar', valueKey: 'staff_count', nameKey: 'name' },
  top_facilities: { title: 'Top Facilities', type: 'bar', valueKey: 'staff_count', nameKey: 'name' },
};

const chartColors = [
  { bg: 'rgba(2, 122, 117, 0.8)', border: '#027a75' },
  { bg: 'rgba(234, 88, 12, 0.8)', border: '#ea580c' },
  { bg: 'rgba(99, 102, 241, 0.8)', border: '#6366f1' },
  { bg: 'rgba(225, 29, 72, 0.8)', border: '#e11d48' },
  { bg: 'rgba(34, 197, 94, 0.8)', border: '#22c55e' },
  { bg: 'rgba(168, 85, 247, 0.8)', border: '#a855f7' },
  { bg: 'rgba(236, 72, 153, 0.8)', border: '#ec4899' },
  { bg: 'rgba(20, 184, 166, 0.8)', border: '#14b8a6' },
  { bg: 'rgba(245, 158, 11, 0.8)', border: '#f59e0b' },
  { bg: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6' },
];

export const useDashboardApiStore = defineStore('dashboardApi', () => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const lastFetched = ref(null);

  const cards = computed(() => {
    const c = data.value?.cards;
    if (!c || typeof c !== 'object') return [];
    return Object.entries(c).map(([key, value]) => {
      const meta = cardMeta[key] || {};
      return {
        key,
        value,
        title: meta.title || key,
        icon: meta.icon || 'bar_chart',
        color: meta.color || 'primary',
      };
    });
  });

  const charts = computed(() => {
    const c = data.value?.charts;
    if (!c || typeof c !== 'object') return [];
    let chartIdx = 0;
    return Object.entries(chartDefs)
      .filter(([key]) => Array.isArray(c[key]) && c[key].length > 0)
      .map(([key, def]) => {
        const items = c[key];
        const labels = items.map(item => {
          if (def.nameKey) {
            const name = item[def.nameKey];
            if (name && typeof name === 'object') return name.en || name.ar || Object.values(name)[0] || '';
            return name || '';
          }
          return item.label || '';
        });
        const values = items.map(item => item[def.valueKey] ?? 0);
        const isPieLike = ['doughnut', 'pie', 'polarArea'].includes(def.type);

        let backgroundColor, borderColor;
        if (isPieLike) {
          backgroundColor = values.map((_, i) => chartColors[i % chartColors.length].bg);
          borderColor = values.map((_, i) => chartColors[i % chartColors.length].border);
        } else if (def.type === 'bar') {
          backgroundColor = values.map((_, i) => chartColors[i % chartColors.length].bg);
          borderColor = values.map((_, i) => chartColors[i % chartColors.length].border);
        } else {
          const color = chartColors[chartIdx % chartColors.length];
          backgroundColor = color.bg;
          borderColor = color.border;
        }
        chartIdx++;

        return {
          key,
          title: def.title,
          type: def.type,
          labels,
          datasets: [{
            label: def.title,
            data: values,
            backgroundColor,
            borderColor,
          }],
        };
      });
  });

  const recentActivity = computed(() => data.value?.recent_activity ?? {});

  const growthPercentages = computed(() => {
    const gp = data.value?.growth_percentages ?? {};
    if (!gp || typeof gp !== 'object') return {};
    const result = {};
    for (const [cardKey, growthKey] of Object.entries(growthKeyMap)) {
      if (gp[growthKey] !== undefined) {
        result[cardKey] = gp[growthKey];
      }
    }
    return result;
  });

  const hasData = computed(() => data.value !== null);

  async function fetchFromApi() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const res = await fetchDashboardData();
      data.value = res.data.data;
      lastFetched.value = Date.now();
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load dashboard';
    } finally {
      loading.value = false;
    }
  }

  function refreshData() {
    data.value = null;
    return fetchFromApi();
  }

  return {
    data, loading, error, lastFetched,
    cards, charts, recentActivity, growthPercentages, hasData,
    fetchFromApi, refreshData,
  };
});
