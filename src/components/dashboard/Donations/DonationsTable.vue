<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDonationsStore } from '@/stores/donations'
import PaymentStatusBadge from '@/components/public/donations/PaymentStatusBadge.vue'

const { t, locale } = useI18n()
const store = useDonationsStore()

const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = 10

const filteredDonations = computed(() => {
  let list = store.donations
  if (statusFilter.value) {
    list = list.filter(d => d.status === statusFilter.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(d =>
      d.donor_name?.toLowerCase().includes(q) ||
      d.donor_email?.toLowerCase().includes(q) ||
      d.story_title?.toLowerCase().includes(q) ||
      d.transaction_ref?.toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredDonations.value.length / perPage))

const paginatedDonations = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredDonations.value.slice(start, start + perPage)
})

watch([search, statusFilter], () => { currentPage.value = 1 })

function formatAmount(amount, currency = 'USD') {
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency', currency,
  }).format(amount)
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const statusTabs = [
  { key: '', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
]
</script>

<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">
          {{ t('donations.allDonations') || 'All Donations' }}
        </h2>
        <div class="flex items-center gap-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              v-model="search"
              type="text"
              :placeholder="t('common.search') || 'Search...'"
              class="pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 dark:text-white placeholder-slate-400 w-56"
            />
          </div>
        </div>
      </div>

      <!-- Status Tabs -->
      <div class="flex gap-2 mt-4 overflow-x-auto">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          class="px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer"
          :class="statusFilter === tab.key
            ? 'bg-brand-primary text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
          @click="statusFilter = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Donor</th>
            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Story</th>
            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-if="store.loading">
            <td colspan="6" class="px-5 py-12 text-center text-slate-400">
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </div>
            </td>
          </tr>
          <tr v-else-if="paginatedDonations.length === 0">
            <td colspan="6" class="px-5 py-12 text-center text-sm text-slate-400">
              {{ t('donations.noDonations') || 'No donations found.' }}
            </td>
          </tr>
          <tr
            v-for="donation in paginatedDonations"
            :key="donation.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <td class="px-5 py-4">
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">{{ donation.donor_name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ donation.donor_email }}</p>
              </div>
            </td>
            <td class="px-5 py-4">
              <p class="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{{ donation.story_title }}</p>
            </td>
            <td class="px-5 py-4">
              <span class="font-bold text-slate-900 dark:text-white">{{ formatAmount(donation.amount, donation.currency) }}</span>
            </td>
            <td class="px-5 py-4">
              <PaymentStatusBadge :status="donation.status" />
            </td>
            <td class="px-5 py-4">
              <span class="text-sm text-slate-600 dark:text-slate-400 capitalize">{{ donation.payment_method || '—' }}</span>
            </td>
            <td class="px-5 py-4">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ formatDate(donation.created_at) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredDonations.length) }} of {{ filteredDonations.length }}
      </p>
      <div class="flex gap-1">
        <button
          :disabled="currentPage <= 1"
          class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
          @click="currentPage--"
        >Prev</button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="w-8 h-8 text-xs font-bold rounded-lg transition cursor-pointer"
          :class="p === currentPage ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="currentPage = p"
        >{{ p }}</button>
        <button
          :disabled="currentPage >= totalPages"
          class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
          @click="currentPage++"
        >Next</button>
      </div>
    </div>
  </div>
</template>
