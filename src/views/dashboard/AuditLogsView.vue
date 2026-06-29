<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuditLogs } from '@/composables/useAuditLogs';
import { resolveTranslatedValue } from '@/utils/locale';
import BaseTable from '@/components/dashboard/global/BaseTable.vue';
import BaseBadge from '@/components/dashboard/global/BaseBadge.vue';
import BasePagination from '@/components/dashboard/global/BasePagination.vue';
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue';
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue';

const { t, locale } = useI18n();
const { logs, loading, error, meta, filters, fetchLogs, setPage, setFilter, resetFilters } = useAuditLogs();

const isRtl = computed(() => locale.value === 'ar');

function _(ar, en) {
  return isRtl.value ? ar : en;
}

const actionOptions = computed(() => [
  { value: '', label: _('الكل', 'All Actions') },
  { value: 'created', label: _('إنشاء', 'Created') },
  { value: 'updated', label: _('تحديث', 'Updated') },
  { value: 'deleted', label: _('حذف', 'Deleted') },
  { value: 'restored', label: _('استعادة', 'Restored') },
]);

const tableOptions = computed(() => [
  { value: '', label: _('الكل', 'All Tables') },
  { value: 'users', label: 'users' },
  { value: 'facilities', label: 'facilities' },
  { value: 'staff', label: 'staff' },
  { value: 'appointments', label: 'appointments' },
]);

const columns = computed(() => [
  { key: 'id', label: '#', width: '64px' },
  { key: 'action', label: _('الإجراء', 'Action'), width: '120px' },
  { key: 'table_name', label: _('الجدول', 'Table'), width: '140px' },
  { key: 'record_id', label: _('معرف السجل', 'Record ID'), width: '140px' },
  { key: 'user', label: _('بواسطة', 'By') },
  { key: 'ip_address', label: _('عنوان IP', 'IP Address'), width: '140px' },
  { key: 'created_at', label: _('التاريخ', 'Date'), width: '170px' },
]);

const selectedLog = ref(null);
const showDetailModal = ref(false);

function viewDetails(log) {
  selectedLog.value = log;
  showDetailModal.value = true;
}

function getUserName(log) {
  if (!log.user) return '—';
  return resolveTranslatedValue(log.user.name, locale.value);
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const actionVariantMap = {
  created: 'success',
  updated: 'warning',
  deleted: 'danger',
  restored: 'info',
};

function getActionVariant(action) {
  return actionVariantMap[action] || 'neutral';
}

function getActionLabel(action) {
  const map = {
    created: _('إنشاء', 'Created'),
    updated: _('تحديث', 'Updated'),
    deleted: _('حذف', 'Deleted'),
    restored: _('استعادة', 'Restored'),
  };
  return map[action] || action;
}

const changedKeys = computed(() => {
  if (!selectedLog.value) return [];
  const oldV = selectedLog.value.old_values || {};
  const newV = selectedLog.value.new_values || {};
  const allKeys = new Set([...Object.keys(oldV), ...Object.keys(newV)]);
  return Array.from(allKeys).map(key => ({
    key,
    oldValue: key in oldV ? JSON.stringify(oldV[key], null, 2) : null,
    newValue: key in newV ? JSON.stringify(newV[key], null, 2) : null,
    changed: JSON.stringify(oldV[key]) !== JSON.stringify(newV[key]),
  }));
});

const hasFilters = computed(() => {
  return filters.value.action || filters.value.table_name || filters.value.date_from || filters.value.date_to;
});

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <div class="space-y-8 animate-fade-in" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.auditLogs') }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ t('pageTitles.auditLogsDesc') }}</p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
      <div class="flex flex-col sm:flex-row gap-4">
        <select
          v-model="filters.action"
          @change="setFilter('action', filters.action)"
          class="w-full sm:w-40 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
        >
          <option v-for="opt in actionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <select
          v-model="filters.table_name"
          @change="setFilter('table_name', filters.table_name)"
          class="w-full sm:w-44 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
        >
          <option v-for="opt in tableOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <input
          type="date"
          v-model="filters.date_from"
          @change="setFilter('date_from', filters.date_from)"
          class="w-full sm:w-44 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
        />

        <input
          type="date"
          v-model="filters.date_to"
          @change="setFilter('date_to', filters.date_to)"
          class="w-full sm:w-44 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
        />

        <button
          v-if="hasFilters"
          @click="resetFilters"
          class="px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          {{ _('إعادة تعيين', 'Reset') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && logs.length === 0" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error && logs.length === 0" class="text-center py-16">
      <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">error_outline</span>
      <p class="text-sm font-bold text-rose-600 dark:text-rose-400">{{ error }}</p>
      <button
        @click="fetchLogs()"
        class="mt-4 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition"
      >
        {{ _('إعادة المحاولة', 'Retry') }}
      </button>
    </div>

    <!-- Table -->
    <div v-else-if="!loading || logs.length > 0">
      <BaseTable :columns="columns" :items="logs" :loading="loading && logs.length > 0">
        <template #cell(id)="{ item }">
          <span class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">#{{ item.id }}</span>
        </template>

        <template #cell(action)="{ item }">
          <button
            @click="viewDetails(item)"
            class="text-left w-full cursor-pointer"
          >
            <BaseBadge :variant="getActionVariant(item.action)">{{ getActionLabel(item.action) }}</BaseBadge>
          </button>
        </template>

        <template #cell(table_name)="{ item }">
          <code class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ item.table_name }}</code>
        </template>

        <template #cell(record_id)="{ item }">
          <span class="text-xs font-mono text-slate-600 dark:text-slate-400">{{ item.record_id?.substring(0, 12) }}...</span>
        </template>

        <template #cell(user)="{ item }">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
              {{ (getUserName(item).charAt(0) || '?').toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{{ getUserName(item) }}</span>
          </div>
        </template>

        <template #cell(ip_address)="{ item }">
          <span class="text-xs font-mono text-slate-500 dark:text-slate-400">{{ item.ip_address || '—' }}</span>
        </template>

        <template #cell(created_at)="{ item }">
          <span class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ formatDateTime(item.created_at) }}</span>
        </template>

        <template #empty>
          <BaseEmptyState
            icon="search_off"
            :title="_('لا توجد سجلات تدقيق', 'No audit logs found')"
            :description="_('لا توجد نشاطات تطابق عوامل التصفية الحالية.', 'No activity matches your current filters.')"
            @reset="resetFilters"
          />
        </template>
      </BaseTable>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="border-t border-slate-100 dark:border-slate-800 pt-2">
        <BasePagination
          :current-page="meta.current_page"
          :total-pages="meta.last_page"
          :total-items="meta.total"
          :items-per-page="meta.per_page"
          @change="setPage"
        />
      </div>
    </div>

    <!-- Detail Modal -->
    <BaseDialog
      :show="showDetailModal"
      :title="_('تفاصيل سجل التدقيق', 'Audit Log Details')"
      size="xl"
      @close="showDetailModal = false"
    >
      <div v-if="selectedLog" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ _('الإجراء', 'Action') }}</p>
            <BaseBadge :variant="getActionVariant(selectedLog.action)">{{ getActionLabel(selectedLog.action) }}</BaseBadge>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ _('الجدول', 'Table') }}</p>
            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedLog.table_name }}</span>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ _('معرف السجل', 'Record ID') }}</p>
            <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">{{ selectedLog.record_id }}</span>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ _('التاريخ', 'Date') }}</p>
            <span class="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{{ formatDateTime(selectedLog.created_at) }}</span>
          </div>
        </div>

        <!-- Changed By -->
        <div v-if="selectedLog.user" class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
            {{ (getUserName(selectedLog).charAt(0) || '?').toUpperCase() }}
          </div>
          <div>
            <p class="text-xs text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest">{{ _('تم التعديل بواسطة', 'Modified By') }}</p>
            <p class="text-sm font-bold text-blue-900 dark:text-blue-200">{{ getUserName(selectedLog) }}</p>
          </div>
        </div>

        <!-- IP & User Agent -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ _('عنوان IP', 'IP Address') }}</p>
            <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">{{ selectedLog.ip_address || '—' }}</span>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{ _('وكيل المستخدم', 'User Agent') }}</p>
            <span class="text-xs text-slate-600 dark:text-slate-400 break-all">{{ selectedLog.user_agent || '—' }}</span>
          </div>
        </div>

        <!-- Data Changes Diff -->
        <div v-if="changedKeys.length > 0">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-base text-brand-primary">compare_arrows</span>
            {{ _('التغييرات', 'Changes') }}
          </h4>
          <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th class="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">{{ _('الحقل', 'Field') }}</th>
                  <th class="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[37.5%]">{{ _('القيمة القديمة', 'Old Value') }}</th>
                  <th class="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[37.5%]">{{ _('القيمة الجديدة', 'New Value') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="ck in changedKeys"
                  :key="ck.key"
                  :class="ck.changed ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''"
                >
                  <td class="px-4 py-3 font-mono text-xs font-bold" :class="ck.changed ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'">
                    <div class="flex items-center gap-2">
                      <span v-if="ck.changed" class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      {{ ck.key }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <code v-if="ck.oldValue !== null" class="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded block whitespace-pre-wrap max-w-xs overflow-x-auto">{{ ck.oldValue }}</code>
                    <span v-else class="text-xs text-slate-400 dark:text-slate-600 italic">{{ _('لا يوجد', 'None') }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <code v-if="ck.newValue !== null" class="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded block whitespace-pre-wrap max-w-xs overflow-x-auto">{{ ck.newValue }}</code>
                    <span v-else class="text-xs text-slate-400 dark:text-slate-600 italic">{{ _('لا يوجد', 'None') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Changes -->
        <div v-else class="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
          {{ _('لا توجد تغييرات في البيانات.', 'No data changes recorded for this action.') }}
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
