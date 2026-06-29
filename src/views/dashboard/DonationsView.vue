<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDonationsStore } from '@/stores/donations'
import DonationsTable from '@/components/dashboard/Donations/DonationsTable.vue'
import StatisticsCard from '@/components/dashboard/global/StatisticsCard.vue'

const { t } = useI18n()
const store = useDonationsStore()

onMounted(() => {
  store.fetchDonations()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">
        {{ t('donations.title') || 'Donations' }}
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {{ t('donations.description') || 'Track and manage all donations across the platform' }}
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard
        icon="favorite"
        :value="store.stats.total"
        :label="t('donations.totalDonations') || 'Total Donations'"
        tone="brand"
      />
      <StatisticsCard
        icon="paid"
        :value="'$' + store.stats.totalAmount"
        :label="t('donations.totalAmount') || 'Total Amount'"
        tone="green"
      />
      <StatisticsCard
        icon="check_circle"
        :value="store.stats.completed"
        :label="t('donations.completed') || 'Completed'"
        tone="emerald"
      />
      <StatisticsCard
        icon="schedule"
        :value="store.stats.pending"
        :label="t('donations.pending') || 'Pending'"
        tone="amber"
      />
    </div>

    <DonationsTable />
  </div>
</template>
