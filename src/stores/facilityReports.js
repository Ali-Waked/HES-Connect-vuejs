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

  const overview = computed(() => data.value?.overview ?? {});
  const charts = computed(() => data.value?.charts ?? []);
  const tables = computed(() => data.value?.tables ?? []);
  const hasData = computed(() => data.value !== null);

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
    overview, charts, tables, hasData,
    fetchReports, updateFilter, resetFilters, applyFilters,
    exportToExcel, exportToPdf,
  };
});
