<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoles } from '../../../composables/useRoles'

const { t } = useI18n()
const { stats, statsLoading, fetchRoleStats } = useRoles()

onMounted(() => {
  fetchRoleStats()
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

    <!-- ── Skeleton cards (loading) ── -->
    <template v-if="statsLoading">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex items-center gap-4 animate-pulse"
      >
        <div class="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
          <div class="h-5 w-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    </template>

    <!-- ── Real cards ── -->
    <template v-else-if="stats">

      <!-- 1. Total Roles -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex items-center gap-4 transition hover:shadow-sm">
        <div class="w-11 h-11 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-violet-600 dark:text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ t('access.stats.total_roles') }}</p>
          <p class="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{{ stats.total_roles ?? 0 }}</p>
        </div>
      </div>

      <!-- 2. Assigned Roles -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex items-center gap-4 transition hover:shadow-sm">
        <div class="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ t('access.stats.assigned_roles') }}</p>
          <p class="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{{ stats.assigned_roles ?? 0 }}</p>
        </div>
      </div>

      <!-- 3. Unassigned Roles -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex items-center gap-4 transition hover:shadow-sm">
        <div class="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21a12.318 12.318 0 01-6.374-1.766z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ t('access.stats.unassigned_roles') }}</p>
          <p class="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{{ stats.unassigned_roles ?? 0 }}</p>
        </div>
      </div>

      <!-- 4. Total Permission Assignments -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex items-center gap-4 transition hover:shadow-sm">
        <div class="w-11 h-11 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-sky-600 dark:text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ t('access.stats.total_permission_assignments') }}</p>
          <p class="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{{ stats.total_permission_assignments ?? 0 }}</p>
        </div>
      </div>

    </template>

  </div>
</template>