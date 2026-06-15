<template>
  <div class="animate-fade-in space-y-6">
    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard icon="calendar_month" :value="todayAppts.length" label="Today's Appointments" tone="brand" />
      <StatsCard icon="group" :value="patientsCount" label="Total Patients" tone="blue" />
      <StatsCard icon="star" :value="avgRatingDisplay" label="Avg Rating" tone="amber" />
      <StatsCard icon="medical_services" :value="pendingPrescriptionsCount" label="Pending Prescriptions" tone="purple" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Today's Schedule -->
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Today's Schedule</h3>
            <p class="text-sm text-slate-500">Appointments for today, sorted by time</p>
          </div>
          <div>
            <button v-if="!loading" class="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" @click="$router.push('/staff/appointments')">View all</button>
          </div>
        </div>

        <div class="mt-4">
          <div v-if="loading">
            <div class="space-y-3">
              <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
              <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
              <div class="h-12 w-full animate-pulse rounded bg-slate-100"></div>
            </div>
          </div>

          <div v-else>
            <template v-if="todayAppts.length">
              <ul class="space-y-3">
                <li v-for="appt in todayApptsSorted" :key="appt.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:shadow-md transition">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 font-bold">{{ appt.time }}</div>
                    <div>
                      <div class="font-semibold text-slate-900">{{ appt.patientName }}</div>
                      <div class="text-xs text-slate-500">{{ appt.facilityName }}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <StatusBadge :status="appt.status" />
                    <div class="flex gap-2">
                                          <button v-if="appt.status !== 'completed'" class="rounded-md bg-brand-primary px-3 py-1.5 text-sm text-white" @click="openConfirm('complete', appt)">Complete</button>
                                          <button v-if="appt.status !== 'cancelled'" class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700" @click="openConfirm('cancel', appt)">Cancel</button>
                    </div>
                  </div>
                </li>
              </ul>
            </template>

            <div v-else class="text-center py-8">
              <div class="text-4xl">🎉</div>
              <p class="mt-2 text-sm font-bold text-slate-900">No appointments today</p>
              <p class="mt-1 text-sm text-slate-500">Enjoy the free time or manage your schedule.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Reviews & Articles -->
      <aside class="space-y-6">
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Recent Reviews</h3>
              <p class="text-sm text-slate-500">Last reviews from patients</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-slate-900">{{ avgRatingDisplay }}</div>
              <div class="text-sm text-slate-500">Based on {{ reviews.length }} reviews</div>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <div v-for="rev in recentReviews" :key="rev.id" class="rounded-lg border border-slate-100 p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <AvatarInitial :name="rev.patientName" size="sm" />
                  <div>
                    <div class="font-semibold text-slate-900">{{ rev.patientName }}</div>
                    <div class="text-xs text-slate-500">{{ rev.date }}</div>
                  </div>
                </div>
                <div class="text-sm font-bold text-amber-600">{{ rev.rating }} ★</div>
              </div>
              <p class="mt-2 text-sm text-slate-700">{{ rev.comment }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900">My Articles</h3>
              <p class="text-sm text-slate-500">Latest articles</p>
            </div>
            <button class="rounded-md border border-slate-200 px-3 py-2 text-sm" @click="$router.push('/admin/articles')">Write New Article</button>
          </div>

          <div class="mt-4 space-y-2">
            <div v-for="art in recentArticles" :key="art.id" class="flex items-center justify-between rounded-md p-2 hover:bg-slate-50 transition">
              <div>
                <div class="font-semibold text-slate-900">{{ resolveTranslatedValue(art.title) }}</div>
                <div class="text-xs text-slate-500">{{ art.category }} • {{ art.date }}</div>
              </div>
              <div class="flex items-center gap-2">
                <StatusBadge :status="art.status" />
                <div class="text-sm text-slate-500">{{ art.views }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Upcoming Unavailable Dates</h3>
              <p class="text-sm text-slate-500">Planned leaves and blocks</p>
            </div>
            <button class="rounded-md border border-slate-200 px-3 py-2 text-sm" @click="$router.push('/staff/schedule')">Manage Schedule</button>
          </div>

          <div class="mt-4">
            <ul class="space-y-2">
              <li v-for="d in upcomingUnavailable" :key="d.id" class="flex items-center justify-between rounded-md p-2 hover:bg-slate-50 transition">
                <div>
                  <div class="font-semibold text-slate-900">{{ d.date }}</div>
                  <div class="text-xs text-slate-500">{{ d.reason }}</div>
                </div>
                <div class="text-sm text-slate-500">&nbsp;</div>
              </li>
            </ul>
            <div v-if="!upcomingUnavailable.length" class="text-sm text-slate-500 mt-3">No upcoming unavailable dates.</div>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <ConfirmModal
    v-model:modelValue="confirm.visible"
    :title="confirm.title"
    :message="confirm.message"
    :confirmText="confirm.confirmText"
    :cancelText="confirm.cancelText"
    @confirm="onConfirm"
    @cancel="onCancel"
  />
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

onMounted(() => {
  setTimeout(() => { loading.value = false }, 600)
})

const todayAppts = computed(() => store.todayAppointments)
const todayApptsSorted = computed(() => [...todayAppts.value].sort((a,b) => a.time.localeCompare(b.time)))
const patientsCount = computed(() => store.patients.length)
const avgRating = computed(() => Math.round((store.avgRating || 0) * 10) / 10)
const avgRatingDisplay = computed(() => (avgRating.value || 0) + '')
const pendingPrescriptionsCount = computed(() => store.medicationRequests.filter(r => r.status === 'pending').length)
const reviews = store.reviews
const recentReviews = computed(() => [...reviews].slice(0,4))
const recentArticles = computed(() => store.articles.slice(0,3))
const upcomingUnavailable = computed(() => store.unavailableDates.filter(d => new Date(d.date) >= new Date()).slice(0,5))

import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'

const confirm = ref({ visible: false, appt: null, action: null, title: '', message: '', confirmText: 'Confirm', cancelText: 'Cancel' })

function openConfirm(action, appt) {
  confirm.value.appt = appt
  confirm.value.action = action
  if (action === 'complete') {
    confirm.value.title = 'Mark Appointment Completed'
    confirm.value.message = `Mark appointment with ${appt.patientName} at ${appt.time} as completed?`
    confirm.value.confirmText = 'Complete'
  } else if (action === 'cancel') {
    confirm.value.title = 'Cancel Appointment'
    confirm.value.message = `Cancel appointment with ${appt.patientName} at ${appt.time}?`
    confirm.value.confirmText = 'Cancel'
  }
  confirm.value.visible = true
}

function onConfirm() {
  const appt = confirm.value.appt
  const action = confirm.value.action
  if (!appt || !action) return
  if (action === 'complete') {
    store.updateAppointmentStatus(appt.id, 'completed')
    store.showToast && store.showToast('Appointment marked completed', 'success')
  } else if (action === 'cancel') {
    store.updateAppointmentStatus(appt.id, 'cancelled')
    store.showToast && store.showToast('Appointment cancelled', 'success')
  }
  confirm.value.visible = false
}

function onCancel() {
  confirm.value.visible = false
}

</script>

<style scoped>
/* rely on Tailwind for styles; keep scoped minimal */
</style>
