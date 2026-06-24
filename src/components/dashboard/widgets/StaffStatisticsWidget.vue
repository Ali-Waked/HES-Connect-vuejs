<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Staff Overview</h3>
        <p class="text-sm text-slate-500">Staff by role</p>
      </div>
      <button class="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" @click="$router.push('/platform/staff')">Manage</button>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-16 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-16 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else class="space-y-3">
        <div v-for="group in staffByRole" :key="group.role" class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">{{ group.count }}</span>
            <div>
              <p class="font-semibold text-slate-900">{{ group.label }}</p>
            </div>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ group.count }} staff</span>
        </div>

        <div v-if="activeDoctors.length" class="mt-4">
          <p class="mb-2 text-sm font-semibold text-slate-700">Active Doctors Today</p>
          <div v-for="doc in activeDoctors" :key="doc.id" class="flex items-center gap-3 rounded-lg border border-slate-100 p-2">
            <AvatarInitial :name="resolveTranslatedValue(doc.name)" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-900 text-sm">{{ resolveTranslatedValue(doc.name) }}</p>
              <p class="text-xs text-slate-500">{{ resolveTranslatedValue(doc.specialization) }}</p>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">Available</span>
          </div>
          <div v-if="!activeDoctors.length" class="py-4 text-center text-sm text-slate-500">No doctors available today.</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

const roleLabels = {
  doctor: 'Doctors',
  nurse: 'Nurses',
  pharmacist: 'Pharmacists',
  receptionist: 'Receptionists'
}

const staffByRole = computed(() => {
  const groups = {}
  store.facilityStaff.forEach(s => {
    const slug = s.role?.slug || 'other'
    if (!groups[slug]) groups[slug] = { role: slug, label: roleLabels[slug] || slug, count: 0 }
    groups[slug].count++
  })
  return Object.values(groups)
})

const activeDoctors = computed(() => store.facilityStaff.filter(s => s.role?.slug === 'doctor'))
</script>
