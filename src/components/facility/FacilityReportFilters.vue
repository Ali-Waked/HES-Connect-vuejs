<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  filters: { type: Object, required: true },
  departments: { type: Array, default: () => [] },
  doctors: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:filters', 'apply', 'reset']);

function update(key, value) {
  emit('update:filters', { ...props.filters, [key]: value });
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">From Date</label>
        <input
          type="date"
          :value="filters.from_date"
          @input="update('from_date', $event.target.value)"
          class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">To Date</label>
        <input
          type="date"
          :value="filters.to_date"
          @input="update('to_date', $event.target.value)"
          class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">{{ t('departments.title') }}</label>
        <select
          :value="filters.department_id"
          @change="update('department_id', $event.target.value)"
          class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        >
          <option value="">{{ t('common.all') }}</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">{{ t('doctors.title') }}</label>
        <select
          :value="filters.doctor_id"
          @change="update('doctor_id', $event.target.value)"
          class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        >
          <option value="">{{ t('common.all') }}</option>
          <option v-for="doc in doctors" :key="doc.id" :value="doc.id">{{ doc.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Appointment Status</label>
        <select
          :value="filters.appointment_status"
          @change="update('appointment_status', $event.target.value)"
          class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        >
          <option value="">{{ t('common.all') }}</option>
          <option value="booked">{{ t('statuses.booked') }}</option>
          <option value="completed">{{ t('statuses.completed') }}</option>
          <option value="cancelled">{{ t('statuses.cancelled') }}</option>
          <option value="rescheduled">{{ t('statuses.rescheduled') }}</option>
        </select>
      </div>
    </div>
    <div class="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
      <button
        @click="$emit('apply')"
        class="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20"
      >
        Apply
      </button>
      <button
        @click="$emit('reset')"
        class="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
      >
        {{ t('common.resetFilters') }}
      </button>
    </div>
  </div>
</template>
