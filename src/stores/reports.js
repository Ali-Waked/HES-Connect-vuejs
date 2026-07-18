import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';
import { getReports, exportExcel, exportPdf } from '@/services/reportService';

export const useReportsStore = defineStore('reports', () => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const exporting = ref({ excel: false, pdf: false });

  const filters = ref({
    from_date: '',
    to_date: '',
    facility_id: '',
    department_id: '',
    status: '',
    category: '',
    search: '',
  });

  const overview = computed(() => data.value?.overview ?? {});

  function resolveField(val) {
    if (val == null) return '—'
    if (typeof val === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
        return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      }
      return val
    }
    if (typeof val === 'object' && !Array.isArray(val)) {
      return val.en || val.ar || Object.values(val)[0] || '—'
    }
    return String(val)
  }

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
    { bg: 'rgba(139, 92, 246, 0.8)', border: '#8b5cf6' },
    { bg: 'rgba(16, 185, 129, 0.8)', border: '#10b981' },
  ];

  const charts = computed(() => {
    const raw = data.value?.charts;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return Object.entries(raw).map(([key, value], idx) => {
      const items = Array.isArray(value) ? value : [];
      const labels = items.map(v => resolveField(v.label ?? v.name ?? v.month ?? ''));
      const values = items.map(v => v.value ?? v.count ?? v.staff_count ?? v.total ?? 0);
      const color = chartColors[idx % chartColors.length];
      return {
        key,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        labels,
        datasets: [{
          label: key.replace(/_/g, ' '),
          data: values,
          backgroundColor: color.bg,
          borderColor: color.border,
        }],
        raw: value,
      };
    });
  });

  const tables = computed(() => {
    const raw = data.value?.tables;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return Object.entries(raw).map(([key, rows]) => {
      const items = Array.isArray(rows) ? rows : [];
      const allKeys = new Set();
      items.forEach(item => Object.keys(item).forEach(k => allKeys.add(k)));
      const hidden = ['uuid', 'id', 'story_uuid', 'user_id', 'facility_id', 'department_id', 'category_id'];
      const columns = [...allKeys]
        .filter(k => !hidden.includes(k))
        .map(k => ({ key: k, label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }));
      const resolvedRows = items.map(item => {
        const row = {};
        for (const k of Object.keys(item)) {
          row[k] = resolveField(item[k]);
        }
        return row;
      });
      return {
        key,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        columns,
        rows: resolvedRows,
      };
    });
  });
  const hasData = computed(() => data.value !== null);

  async function fetchReports() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const params = Object.fromEntries(
        Object.entries(filters.value).filter(([, v]) => v !== '')
      );
      const res = await getReports(params);
      data.value = res.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load reports';
    } finally {
      loading.value = false;
    }
  }

  function setFilter(key, value) {
    filters.value[key] = value;
  }

  function resetFilters() {
    filters.value = {
      from_date: '',
      to_date: '',
      facility_id: '',
      department_id: '',
      status: '',
      category: '',
      search: '',
    };
  }

  function applyFilters() {
    return fetchReports();
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async function exportToExcel() {
    exporting.value.excel = true;
    try {
      const params = Object.fromEntries(
        Object.entries(filters.value).filter(([, v]) => v !== '')
      );
      const res = await exportExcel(params);
      const contentType = res.headers?.['content-type'] || '';
      if (contentType.includes('json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        error.value = json.message || 'Export failed';
        return;
      }
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
      const params = Object.fromEntries(
        Object.entries(filters.value).filter(([, v]) => v !== '')
      );
      const res = await exportPdf(params);
      const contentType = res.headers?.['content-type'] || '';
      if (contentType.includes('json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        error.value = json.message || 'Export failed';
        return;
      }
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
    fetchReports, setFilter, resetFilters, applyFilters,
    exportToExcel, exportToPdf,
  };
});
