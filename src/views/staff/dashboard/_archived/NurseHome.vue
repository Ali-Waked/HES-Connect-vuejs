<template>
  <div class="animate-fade-in space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard icon="calendar_month" :value="todayAppts.length" label="Today's Appointments" tone="brand" />
      <StatsCard icon="group" :value="patientsSeen" label="Patients Seen This Month" tone="blue" />
      <StatsCard icon="stethoscope" :value="activeDoctors" label="Active Doctors Today" tone="green" />
      <StatsCard icon="schedule" :value="pendingAppts" label="Pending Appointments" tone="amber" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section class="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Today's Appointment Queue</h3>
            <p class="text-sm text-slate-500">All appointments today</p>
          </div>
        </div>
        <div class="mt-4">
          <div v-if="loading" class="space-y-3">
            <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
            <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
            <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
          </div>
          <div v-else-if="todayAppts.length">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">#</th>
                    <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Patient</th>
                    <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Doctor</th>
                    <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Time</th>
                    <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(appt, i) in sorted" :key="appt.id" class="transition hover:bg-slate-50/70/70">
                    <td class="px-4 py-3 text-sm text-slate-500">{{ i + 1 }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <AvatarInitial :name="resolveTranslatedValue(appt.patientName)" size="sm" />
                        <span class="font-semibold text-slate-900">{{ resolveTranslatedValue(appt.patientName) }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-700">{{ appt.doctorName }}</td>
                    <td class="px-4 py-3 text-sm text-slate-700">{{ appt.time }}</td>
                    <td class="px-4 py-3"><StatusBadge :status="appt.status" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="py-8 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300">calendar_today</span>
            <p class="mt-2 text-sm font-bold text-slate-900">No appointments today</p>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Active Doctors Today</h3>
          <p class="text-sm text-slate-500">Currently available</p>
        </div>
        <div class="mt-4 space-y-3">
          <div v-if="loading">
            <div class="h-16 w-full animate-pulse rounded bg-slate-100"></div>
            <div class="h-16 w-full animate-pulse rounded bg-slate-100"></div>
          </div>
          <div v-else v-for="doc in activeDoctorsList" :key="doc.id" class="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
            <AvatarInitial :name="resolveTranslatedValue(doc.name)" />
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-900">{{ resolveTranslatedValue(doc.name) }}</p>
              <p class="text-xs text-slate-500">{{ resolveTranslatedValue(doc.specialization) }}</p>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">Available</span>
          </div>
          <div v-if="!loading && !activeDoctorsList.length" class="py-6 text-center text-sm text-slate-500">No doctors available today.</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StatsCard from '@/components/staff/shared/StatsCard.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })

const todayAppts = computed(() => store.todayAppointments)
const sorted = computed(() => [...todayAppts.value].sort((a, b) => a.time.localeCompare(b.time)))
const patientsSeen = computed(() => store.appointments.filter(a => a.status === 'completed').length)
const activeDoctors = computed(() => store.facilityStaff.filter(s => s.role?.slug === 'doctor').length)
const pendingAppts = computed(() => store.bookedAppointments.length)
const activeDoctorsList = computed(() => store.facilityStaff.filter(s => s.role?.slug === 'doctor'))
</script>
