import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getDashboard } from '@/services/facilityDashboardService';
import { useWorkspaceStore } from '@/stores/workspace';

const palette = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#e11d48'];

const cardMeta = {
  total_appointments: { icon: 'calendar_month', color: 'info', title: 'Appointments' },
  total_articles: { icon: 'article', color: 'primary', title: 'Articles' },
  total_categories: { icon: 'category', color: 'neutral', title: 'Categories' },
  total_departments: { icon: 'business', color: 'primary', title: 'Departments' },
  total_doctors: { icon: 'stethoscope', color: 'success', title: 'Doctors' },
  total_donations: { icon: 'volunteer_activism', color: 'danger', title: 'Donations' },
  total_job_posts: { icon: 'work', color: 'warning', title: 'Job Posts' },
  total_patients: { icon: 'group', color: 'danger', title: 'Patients' },
  total_staff: { icon: 'badge', color: 'info', title: 'Staff' },
  total_stories: { icon: 'auto_stories', color: 'success', title: 'Stories' },
};

const growthKeyMap = {
  total_appointments: 'appointments_growth',
  total_articles: 'articles_growth',
  total_categories: 'categories_growth',
  total_departments: 'departments_growth',
  total_doctors: 'doctors_growth',
  total_donations: 'donations_growth',
  total_job_posts: 'job_posts_growth',
  total_patients: 'patients_growth',
  total_staff: 'staff_growth',
  total_stories: 'stories_growth',
};

export const useFacilityDashboardStore = defineStore('facilityDashboard', () => {
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
        title: meta.title || key.replace(/_/g, ' '),
        icon: meta.icon || 'bar_chart',
        color: meta.color || 'primary',
      };
    });
  });

  const charts = computed(() => {
    const c = data.value?.charts;
    if (!c || typeof c !== 'object') return [];
    const result = [];

    function addChart(key, type, title) {
      const arr = c[key];
      if (!Array.isArray(arr) || !arr.length) return;
      const labels = arr.map(i => i.label ?? i.month ?? i.name ?? i.status ?? '');
      const values = arr.map(i => i.value ?? i.count ?? i.total ?? i.staff_count ?? 0);
      const colors = values.map((_, i) => palette[i % palette.length]);
      result.push({
        type,
        title,
        labels,
        datasets: [{
          label: title,
          data: values,
          backgroundColor: type === 'doughnut' || type === 'pie' ? colors : palette[0],
          borderColor: palette[0],
        }],
      });
    }

    addChart('appointment_status', 'doughnut', 'Appointment Status');
    addChart('appointments_per_month', 'line', 'Appointments per Month');
    addChart('articles_published', 'bar', 'Articles Published');
    addChart('patients_growth', 'line', 'Patients Growth');
    addChart('doctors_growth', 'line', 'Doctors Growth');
    addChart('stories_published', 'bar', 'Stories Published');
    addChart('top_departments', 'horizontalBar', 'Top Departments');

    return result;
  });

  const recentData = computed(() => data.value?.recent_data ?? {});

  const growthPercentages = computed(() => {
    const gp = data.value?.growth_percentages ?? {};
    const result = {};
    for (const [cardKey, growthKey] of Object.entries(growthKeyMap)) {
      if (gp[growthKey] !== undefined) {
        result[cardKey] = gp[growthKey];
      }
    }
    return result;
  });

  const hasData = computed(() => data.value !== null);

  const combinedCards = computed(() => {
    const gp = growthPercentages.value;
    return cards.value.map(c => ({
      ...c,
      growth: gp[c.key] ?? null,
    }));
  });

  function buildTables(source) {
    if (!source || typeof source !== 'object') return [];
    return Object.entries(source)
      .filter(([, items]) => Array.isArray(items) && items.length)
      .map(([key, items]) => {
        const columns = Object.keys(items[0]).map(k => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        }));
        return {
          title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          columns,
          rows: items,
        };
      });
  }

  const topTables = computed(() => {
    const c = data.value?.charts;
    if (!c) return [];
    const map = {};
    if (Array.isArray(c.top_departments) && c.top_departments.length) map['top_departments'] = c.top_departments;
    if (Array.isArray(c.top_doctors) && c.top_doctors.length) map['top_doctors'] = c.top_doctors;
    if (Array.isArray(c.top_symptoms) && c.top_symptoms.length) map['top_symptoms'] = c.top_symptoms;
    return buildTables(map);
  });

  const recentTables = computed(() => buildTables(data.value?.recent_data));

  async function fetchDashboard() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const workspaceStore = useWorkspaceStore();
      const facilityUuid = workspaceStore.currentFacility?.uuid;
      if (!facilityUuid) throw new Error('No facility selected');
      const res = await getDashboard(facilityUuid);
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
    cards, charts, recentData, growthPercentages, hasData, combinedCards,
    topTables, recentTables,
    fetchDashboard, refreshDashboard,
  };
});
