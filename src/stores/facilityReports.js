import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getReports, exportExcel, exportPdf } from '@/services/facilityReportService';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const palette = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#e11d48'];

export const useFacilityReportsStore = defineStore('facilityReports', () => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const exporting = ref({ excel: false, pdf: false });

  const filters = ref({
    from_date: '',
    to_date: '',
    department_id: '',
    doctor_id: '',
    appointment_status: '',
  });

  const hasData = computed(() => data.value !== null);

  const overview = computed(() => data.value?.cards ?? {});

  const growthPercentages = computed(() => data.value?.growth_percentages ?? {});

  const charts = computed(() => {
    const c = data.value?.charts;
    if (!c || typeof c !== 'object') return [];
    const result = [];

    function pick(arr) {
      if (!Array.isArray(arr) || !arr.length) return null;
      return arr;
    }

    function labelOf(item) {
      return item.label ?? item.month ?? item.name ?? item.status ?? '';
    }

    function valueOf(item) {
      return item.value ?? item.count ?? item.total ?? item.staff_count ?? 0;
    }

    function addChart(key, type, title) {
      const arr = pick(c[key]);
      if (!arr) return;
      const labels = arr.map(labelOf);
      const values = arr.map(valueOf);
      const colors = values.map((_, i) => palette[i % palette.length]);
      result.push({
        type,
        title,
        labels,
        datasets: [{ label: title, data: values, backgroundColor: type === 'doughnut' || type === 'pie' ? colors : palette[0], borderColor: palette[0] }],
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

  const recentTables = computed(() => buildTables(data.value?.recent_data));

  const topTables = computed(() => {
    const c = data.value?.charts;
    if (!c) return [];
    const map = {};
    if (Array.isArray(c.top_departments) && c.top_departments.length) map['top_departments'] = c.top_departments;
    if (Array.isArray(c.top_doctors) && c.top_doctors.length) map['top_doctors'] = c.top_doctors;
    if (Array.isArray(c.top_symptoms) && c.top_symptoms.length) map['top_symptoms'] = c.top_symptoms;
    return buildTables(map);
  });

  function activeParams() {
    return Object.fromEntries(
      Object.entries(filters.value).filter(([, v]) => v !== '')
    );
  }

  async function fetchReports() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const res = await getReports(activeParams());
      data.value = res.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load reports';
    } finally {
      loading.value = false;
    }
  }

  function updateFilter(key, value) {
    filters.value[key] = value;
  }

  function resetFilters() {
    filters.value = {
      from_date: '',
      to_date: '',
      department_id: '',
      doctor_id: '',
      appointment_status: '',
    };
  }

  function applyFilters() {
    return fetchReports();
  }

  async function exportToExcel() {
    exporting.value.excel = true;
    try {
      const res = await exportExcel(activeParams());
      downloadBlob(res.data, `reports-${Date.now()}.xlsx`);
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Export failed';
    } finally {
      exporting.value.excel = false;
    }
  }

  async function exportToPdf() {
    exporting.value.pdf = true;
    try {
      const res = await exportPdf(activeParams());
      downloadBlob(res.data, `reports-${Date.now()}.pdf`);
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Export failed';
    } finally {
      exporting.value.pdf = false;
    }
  }

  return {
    data, loading, error, exporting, filters,
    overview, charts, hasData, growthPercentages, recentTables, topTables,
    fetchReports, updateFilter, resetFilters, applyFilters,
    exportToExcel, exportToPdf,
  };
});
