<template>
  <div class="animate-fade-in space-y-6">
    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <StatsCard v-if="can('view_appointments')" icon="calendar_month" :value="todayAppts.length" label="Today's Appointments" tone="brand" />
      <StatsCard v-if="can('view_patients')" icon="group" :value="store.patients.length" label="Total Patients" tone="blue" />
      <StatsCard v-if="can('view_staff')" icon="badge" :value="store.facilityStaff.length" label="Total Staff" tone="slate" />
      <StatsCard v-if="can('view_medication_requests')" icon="inbox" :value="store.pendingRequests.length" label="Pending Requests" tone="amber" />
      <StatsCard v-if="can('view_medicines')" icon="warning" :value="store.lowStockItems.length" label="Low Stock Items" tone="red" />
      <StatsCard v-if="can('view_prescriptions')" icon="description" :value="pendingPrescriptions" label="Pending Prescriptions" tone="purple" />
      <StatsCard v-if="can('view_departments') || can('view_dashboard_statistics')" icon="domain" :value="store.departments.length" label="Departments" tone="blue" />
    </div>

    <!-- Facility Owner: Full Analytics Section -->
    <template v-if="can('view_dashboard_statistics')">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon="calendar_month" :value="store.appointments.length" label="Total Appointments" tone="brand" />
        <StatsCard icon="group" :value="store.patients.length" label="Total Patients" tone="blue" />
        <StatsCard icon="badge" :value="store.facilityStaff.length" label="Total Staff" tone="green" />
      </div>
    </template>

    <!-- Main Widget Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <AppointmentsWidget v-if="can('view_appointments')" :showActions="can('update_appointment')" />
        <MedicineRequestsWidget v-else-if="can('view_medication_requests')" :showActions="can('update_medication_request')" />
        <PrescriptionsWidget v-else-if="can('view_prescriptions')" />
      </div>

      <!-- Right column (1/3) -->
      <div class="space-y-6">
        <StaffStatisticsWidget v-if="can('view_staff')" />
        <DepartmentStatisticsWidget v-else-if="can('departments.view')" />
        <ScheduleWidget v-if="can('view_staff_schedules')" />
      </div>
    </div>

    <!-- Lower Widgets Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InventoryWidget v-if="can('view_medicines')" />
      <PatientsWidget v-if="can('view_patients') && !can('view_appointments')" />
      <PrescriptionsWidget v-if="can('view_prescriptions') && !can('view_appointments')" />
    </div>

    <!-- Facility Owner: Additional Sections -->
    <template v-if="can('view_dashboard_statistics')">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Appointments This Week</h3>
            <p class="text-sm text-slate-500">Count by day (Sun–Sat)</p>
          </div>
          <div class="mt-6">
            <svg viewBox="0 0 350 180" class="w-full">
              <text x="10" y="20" font-size="11" fill="#94a3b8">{{ maxCount }}</text>
              <text x="10" y="60" font-size="11" fill="#94a3b8">{{ Math.round(maxCount/2) }}</text>
              <text x="10" y="100" font-size="11" fill="#94a3b8">0</text>
              <line x1="40" y1="15" x2="40" y2="105" stroke="#e2e8f0" stroke-width="1" />
              <line x1="40" y1="105" x2="340" y2="105" stroke="#e2e8f0" stroke-width="1" />
              <g v-for="(d, i) in weekData" :key="i">
                <rect :x="55 + i * 42" y="105" width="28" :height="barHeight(d)" :rx="4" :fill="d.isToday ? '#027a75' : '#cbd5e1'" />
                <text :x="55 + i * 42 + 14" y="125" font-size="10" text-anchor="middle" fill="#64748b">{{ d.label }}</text>
                <text :x="55 + i * 42 + 14" y="115 - barHeight(d) - 4" font-size="10" text-anchor="middle" fill="#334155">{{ d.count }}</text>
              </g>
            </svg>
          </div>
        </section>

        <DepartmentStatisticsWidget />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import StatsCard from '@/components/staff/shared/StatsCard.vue'
import AppointmentsWidget from '@/components/dashboard/widgets/AppointmentsWidget.vue'
import PatientsWidget from '@/components/dashboard/widgets/PatientsWidget.vue'
import PrescriptionsWidget from '@/components/dashboard/widgets/PrescriptionsWidget.vue'
import MedicineRequestsWidget from '@/components/dashboard/widgets/MedicineRequestsWidget.vue'
import StaffStatisticsWidget from '@/components/dashboard/widgets/StaffStatisticsWidget.vue'
import DepartmentStatisticsWidget from '@/components/dashboard/widgets/DepartmentStatisticsWidget.vue'
import InventoryWidget from '@/components/dashboard/widgets/InventoryWidget.vue'
import ScheduleWidget from '@/components/dashboard/widgets/ScheduleWidget.vue'

const store = useStaffStore()
const { can } = useAuthPermissions()

const todayAppts = computed(() => store.todayAppointments)
const pendingPrescriptions = computed(() => store.medicationRequests.filter(r => r.status === 'pending').length)

// Chart data for facility owner analytics
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const todayIdx = new Date().getDay()

const weekData = computed(() => dayNames.map((label, i) => {
  const count = store.appointments.filter(a => {
    const d = new Date(a.date)
    return d.getDay() === i
  }).length
  return { label, count, isToday: i === todayIdx }
}))

const maxCount = computed(() => Math.max(1, ...weekData.value.map(d => d.count)))
const barHeight = (d) => Math.max(4, (d.count / maxCount.value) * 80)
</script>
