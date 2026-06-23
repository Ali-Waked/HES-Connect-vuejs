<template>
  <div class="animate-fade-in space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Facility overview at a glance</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <StatsCard v-if="can('appointments.view')" icon="calendar_month" :value="store.todayAppointments.length" label="Today's Appointments" tone="brand" />
      <StatsCard v-if="can('patients.view')" icon="group" :value="store.patients.length" label="Total Patients" tone="blue" />
      <StatsCard v-if="can('staff.view')" icon="badge" :value="store.facilityStaff.length" label="Total Staff" tone="slate" />
      <StatsCard v-if="can('medication_requests.view')" icon="inbox" :value="store.pendingRequests.length" label="Pending Requests" tone="amber" />
      <StatsCard v-if="can('inventory.view')" icon="warning" :value="store.lowStockItems.length" label="Low Stock Items" tone="red" />
      <StatsCard v-if="can('prescriptions.view')" icon="description" :value="pendingPrescriptions" label="Pending Prescriptions" tone="purple" />
      <StatsCard v-if="can('departments.view')" icon="domain" :value="store.departments.length" label="Departments" tone="teal" />
      <StatsCard v-if="can('medicines.view')" icon="medication" :value="store.inventory.length" label="Medicines" tone="indigo" />
      <StatsCard v-if="can('reviews.view')" icon="star" :value="store.reviews.length" label="Reviews" tone="yellow" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <AppointmentsWidget v-if="can('appointments.view')" :showActions="can('appointments.manage')" />
        <MedicineRequestsWidget v-if="can('medication_requests.view')" :showActions="can('medication_requests.manage')" />
        <PrescriptionsWidget v-if="can('prescriptions.view')" />
      </div>
      <div class="space-y-6">
        <StaffStatisticsWidget v-if="can('staff.view')" />
        <DepartmentStatisticsWidget v-if="can('departments.view')" />
        <ScheduleWidget v-if="can('schedule.view')" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InventoryWidget v-if="can('inventory.view')" />
      <PatientsWidget v-if="can('patients.view') && !can('appointments.view')" />
    </div>
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

const pendingPrescriptions = computed(() => store.medicationRequests.filter(r => r.status === 'pending').length)
</script>
