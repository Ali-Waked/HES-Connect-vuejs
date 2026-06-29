<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFormatDate } from '@/composables/useFormatDate'
import { useFacilities } from '../composables/useFacilities'
import { useToast } from '@/shared/composables/useToast'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { localField } = useLocaleField()
const { formatDate } = useFormatDate()
const facilities = useFacilities()
const toast = useToast()

const facilityId = computed(() => route.params.id)

const detailTabs = ref([
  { key: 'overview', label: 'Overview' },
  { key: 'staff', label: 'Staff' },
  { key: 'reviews', label: 'Reviews' },
])

const activeTab = ref('overview')

onMounted(async () => {
  await facilities.loadItem(facilityId.value)
})
</script>

<template>
  <div>
    <PageHeader :title="localField(facilities.currentFacility?.name) || 'Facility Details'" back-to="/platform/facilities">
      <template #actions>
        <button
          class="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          @click="router.push(`/platform/facilities/${facilityId}/edit`)"
        >
          Edit
        </button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="facilities.loading.value" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse"></div>
    </div>

    <!-- Error -->
    <EmptyState
      v-else-if="facilities.error.value"
      title="Failed to load facility"
      :description="facilities.error.value"
      icon="error"
    />

    <!-- Content -->
    <template v-else-if="facilities.currentFacility">
      <!-- Tabs -->
      <div class="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
        <button
          v-for="tab in detailTabs"
          :key="tab.key"
          class="px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer"
          :class="activeTab === tab.key ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">General Information</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Name (English)</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ facilities.currentFacility.name?.en || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Name (Arabic)</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ facilities.currentFacility.name?.ar || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Type</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ facilities.currentFacility.facility_type || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Status</dt>
                <dd class="mt-0.5">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    :class="facilities.currentFacility.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : facilities.currentFacility.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'"
                  >
                    {{ facilities.currentFacility.status }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Email</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ facilities.currentFacility.email || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</dt>
                <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ facilities.currentFacility.phone || '—' }}</dd>
              </div>
            </dl>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Description</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ localField(facilities.currentFacility.description) || 'No description provided.' }}</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Location</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400">City</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ localField(facilities.currentFacility.city?.name) || '—' }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Organization</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ localField(facilities.currentFacility.organization?.name) || '—' }}</p>
              </div>
              <div v-if="facilities.currentFacility.latitude && facilities.currentFacility.longitude">
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Coordinates</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ facilities.currentFacility.latitude }}, {{ facilities.currentFacility.longitude }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Statistics</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Staff Count</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ facilities.currentFacility.staff_count || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Department Count</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ facilities.currentFacility.departments_count || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Average Rating</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ facilities.currentFacility.average_rating ?? '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Staff Tab -->
      <div v-if="activeTab === 'staff'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">Staff management will be available here.</p>
      </div>

      <!-- Reviews Tab -->
      <div v-if="activeTab === 'reviews'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">Reviews will be visible here.</p>
      </div>
    </template>
  </div>
</template>
