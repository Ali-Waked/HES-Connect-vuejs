<script setup>
import { onMounted, computed } from 'vue'
import { useFacilityDashboardStore } from '@/stores/facility-dashboard'
import StatCard from '@/components/facility-owner/StatCard.vue'
import AppointmentTable from '@/components/facility-owner/AppointmentTable.vue'
import DoctorCard from '@/components/facility-owner/DoctorCard.vue'
import AlertCard from '@/components/facility-owner/AlertCard.vue'
import ChartWrapper from '@/components/facility-owner/ChartWrapper.vue'
import CalendarView from '@/components/facility-owner/CalendarView.vue'

const store = useFacilityDashboardStore()

const kpiCards = computed(() => [
  { icon: 'calendar_today', value: store.dashboard.total_appointments_today, label: "Today's Appointments", subtitle: `${store.dashboard.total_appointments_today} scheduled`, tone: 'brand' },
  { icon: 'date_range', value: store.dashboard.total_appointments_month, label: 'Monthly Appointments', subtitle: `${Math.round(store.dashboard.completed_appointments / Math.max(store.dashboard.total_appointments_month, 1) * 100)}% fill rate`, tone: 'blue' },
  { icon: 'check_circle', value: store.dashboard.completed_appointments, label: 'Completed', subtitle: `${Math.round(store.dashboard.completed_appointments / Math.max(store.dashboard.total_appointments_month, 1) * 100)}% of total`, tone: 'green' },
  { icon: 'cancel', value: store.dashboard.cancelled_appointments, label: 'Cancelled', subtitle: `${Math.round(store.dashboard.cancelled_appointments / Math.max(store.dashboard.total_appointments_month, 1) * 100)}% rate`, tone: 'red' },
  { icon: 'stethoscope', value: store.dashboard.active_doctors_count, label: 'Active Doctors', subtitle: `${store.dashboard.active_doctors_count} on duty today`, tone: 'purple' },
  { icon: 'group', value: store.dashboard.total_patients_count, label: 'Total Patients', subtitle: `+${store.patientsOverview.new} new this month`, tone: 'amber' },
  { icon: 'payments', value: `$${(store.dashboard.revenue_total || 0).toLocaleString()}`, label: 'Revenue', subtitle: 'This month', tone: 'green' }
])

const appointmentsPerDayChart = computed(() => ({
  labels: (store.analytics.appointments_per_day || []).map(d => d.day || d.label),
  datasets: [{
    label: 'Appointments',
    data: (store.analytics.appointments_per_day || []).map(d => d.count || d.value),
    backgroundColor: '#027a75',
    borderRadius: 4
  }]
}))

const peakHoursChart = computed(() => ({
  labels: (store.analytics.peak_hours || []).map(d => d.hour || d.label),
  datasets: [{
    label: 'Patients',
    data: (store.analytics.peak_hours || []).map(d => d.count || d.value),
    backgroundColor: '#0891b2',
    borderRadius: 4
  }]
}))

const cancellationTrendsChart = computed(() => ({
  labels: (store.analytics.cancellation_trends || []).map(d => d.month || d.label),
  datasets: [{
    label: 'Cancellation Rate %',
    data: (store.analytics.cancellation_trends || []).map(d => d.rate || d.value),
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.1)',
    fill: true,
    tension: 0.3,
    pointBackgroundColor: '#ef4444',
    pointRadius: 4
  }]
}))

onMounted(() => {
  store.fetchAll()
})
</script>

<template>
  <div class="space-y-8 animate-fade-in">

    <!-- ── Section 1: KPI Cards ── -->
    <div>
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Facility Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time overview of your facility operations</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="material-symbols-outlined text-base">sync</span>
          <span>Updated just now</span>
        </div>
      </div>

      <div v-if="store.loading.dashboard" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <div v-for="i in 7" :key="i" class="card-base p-5">
          <div class="w-20 h-3 skeleton-shimmer rounded mb-3"></div>
          <div class="w-12 h-6 skeleton-shimmer rounded mb-2"></div>
          <div class="w-16 h-2 skeleton-shimmer rounded"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard v-for="(card, idx) in kpiCards" :key="idx" v-bind="card" />
      </div>
    </div>

    <!-- ── Section 2+3: Live Appointments + Doctors Performance ── -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AppointmentTable :appointments="store.liveAppointments" :loading="store.loading.liveAppointments" />

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-primary text-lg">star</span>
            Doctors Performance
          </h3>
        </div>
        <div v-if="store.loading.doctors" class="space-y-3">
          <div v-for="i in 3" :key="i" class="card-base p-4 space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 skeleton-shimmer rounded-full"></div>
              <div class="space-y-1.5 flex-1">
                <div class="w-28 h-3 skeleton-shimmer rounded"></div>
                <div class="w-20 h-2 skeleton-shimmer rounded"></div>
              </div>
            </div>
            <div class="w-full h-2 skeleton-shimmer rounded"></div>
          </div>
        </div>
        <div v-else-if="store.doctorsPerformance.length === 0" class="empty-state py-8">
          <div class="empty-state-icon">
            <span class="material-symbols-outlined empty-state-icon-svg">stethoscope</span>
          </div>
          <p class="text-sm font-semibold text-slate-500">No doctor performance data</p>
        </div>
        <div v-else class="space-y-3">
          <DoctorCard v-for="doc in store.doctorsPerformance" :key="doc.id" :doctor="doc" />
        </div>
      </div>
    </div>

    <!-- ── Section 4+5: Patients Overview + Schedule ── -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Patients Overview -->
      <div class="card-base p-5">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
          <span class="material-symbols-outlined text-brand-primary text-lg">group</span>
          Patients Overview
        </h3>

        <div v-if="store.loading.patients" class="space-y-4">
          <div class="flex gap-4">
            <div v-for="i in 3" :key="i" class="flex-1 p-3 skeleton-shimmer rounded-lg h-16"></div>
          </div>
        </div>
        <div v-else>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 p-3 text-center">
              <p class="text-xl font-bold text-slate-900 dark:text-white">{{ (store.patientsOverview.total || 0).toLocaleString() }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total</p>
            </div>
            <div class="rounded-xl bg-blue-50/50 dark:bg-blue-900/20 p-3 text-center">
              <p class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ store.patientsOverview.new || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">New</p>
            </div>
            <div class="rounded-xl bg-amber-50/50 dark:bg-amber-900/20 p-3 text-center">
              <p class="text-xl font-bold text-amber-700 dark:text-amber-300">{{ store.patientsOverview.returning || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Returning</p>
            </div>
          </div>

          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top Patients</h4>
          <div v-if="store.patientsOverview.top_patients.length === 0" class="text-xs text-slate-400 text-center py-4">No patient data available</div>
          <div v-else class="space-y-2">
            <div v-for="p in store.patientsOverview.top_patients" :key="p.id" class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {{ (p.name || '?').charAt(0) }}
                </div>
                <span class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ p.name }}</span>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ p.visits || p.appointments_count || 0 }} visits</p>
                <p class="text-[10px] text-slate-400">Last: {{ p.lastVisit || p.last_visit || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Calendar -->
      <CalendarView :schedules="store.schedules" :loading="store.loading.schedules" />
    </div>

    <!-- ── Section 6: Analytics Charts ── -->
    <div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
        <span class="material-symbols-outlined text-brand-primary text-lg">monitoring</span>
        Analytics
      </h3>

      <div v-if="store.loading.analytics" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="card-base p-5 h-64">
          <div class="w-24 h-3 skeleton-shimmer rounded mb-4"></div>
          <div class="w-full h-48 skeleton-shimmer rounded"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="card-base p-5">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Appointments Per Day</h4>
          <ChartWrapper type="bar" :data="appointmentsPerDayChart" :options="{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }, x: { ticks: { color: '#94a3b8', font: { size: 10 } } } }
          }" height="h-52" />
        </div>
        <div class="card-base p-5">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Peak Hours</h4>
          <ChartWrapper type="bar" :data="peakHoursChart" :options="{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }, x: { ticks: { color: '#94a3b8', font: { size: 9 } } } }
          }" height="h-52" />
        </div>
        <div class="card-base p-5">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Cancellation Trends</h4>
          <ChartWrapper type="line" :data="cancellationTrendsChart" :options="{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 20, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => v + '%' } }, x: { ticks: { color: '#94a3b8', font: { size: 10 } } } }
          }" height="h-52" />
        </div>
      </div>
    </div>

    <!-- ── Section 7: Alerts Panel ── -->
    <div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
        <span class="material-symbols-outlined text-brand-primary text-lg">warning</span>
        Alerts & Notifications
      </h3>

      <div v-if="store.loading.alerts" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-20 skeleton-shimmer rounded-xl"></div>
      </div>
      <div v-else-if="store.alerts.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined empty-state-icon-svg">check_circle</span>
        </div>
        <p class="text-sm font-semibold text-slate-500">All clear — no alerts at this time</p>
      </div>
      <div v-else class="space-y-3">
        <AlertCard v-for="alert in store.alerts" :key="alert.id" :alert="alert" />
      </div>
    </div>
  </div>
</template>
