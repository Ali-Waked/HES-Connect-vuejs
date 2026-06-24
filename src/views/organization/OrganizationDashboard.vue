<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Organization Dashboard</h1>
        <p class="text-sm text-slate-500">Overview of your organization</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard v-if="can('facilities.view')" icon="home_health" :value="facilityCount" label="Facilities" tone="brand" />
      <StatsCard v-if="can('staff.view')" icon="badge" :value="staffCount" label="Total Staff" tone="blue" />
      <StatsCard v-if="can('patients.view')" icon="group" :value="patientCount" label="Patients" tone="green" />
      <StatsCard v-if="can('appointments.view')" icon="calendar_month" :value="appointmentCount" label="Total Appointments" tone="purple" />
      <StatsCard v-if="can('reviews.view')" icon="star" :value="reviewCount" label="Reviews" tone="amber" />
    </div>

    <!-- Main Widget Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <AppointmentsWidget v-if="can('appointments.view')" />
        <FacilitiesOverviewWidget v-if="can('facilities.view')" />
      </div>
      <div class="space-y-6">
        <StaffStatisticsWidget v-if="can('staff.view')" />
        <DepartmentStatisticsWidget v-if="can('departments.view')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import StatsCard from '@/components/staff/shared/StatsCard.vue'
import AppointmentsWidget from '@/components/dashboard/widgets/AppointmentsWidget.vue'
import StaffStatisticsWidget from '@/components/dashboard/widgets/StaffStatisticsWidget.vue'
import DepartmentStatisticsWidget from '@/components/dashboard/widgets/DepartmentStatisticsWidget.vue'
import FacilitiesOverviewWidget from '@/components/dashboard/widgets/FacilitiesOverviewWidget.vue'

const store = useStaffStore()
const { can } = useAuthPermissions()

const facilityCount = computed(() => 3)
const staffCount = computed(() => store.facilityStaff.length)
const patientCount = computed(() => store.patients.length)
const appointmentCount = computed(() => store.appointments.length)
const reviewCount = computed(() => store.reviews.length)
</script>
