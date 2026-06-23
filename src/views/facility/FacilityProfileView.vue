<script setup>
import { useStaffStore } from '@/stores/useStaffStore'
import { resolveTranslatedValue } from '@/utils/locale'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'

const store = useStaffStore()
</script>

<template>
  <div class="animate-fade-in max-w-3xl mx-auto space-y-8">
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
      <div class="h-32 bg-gradient-to-r from-brand-primary to-brand-primary-dark" />
      <div class="px-6 pb-6">
        <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <div class="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-3xl font-bold text-brand-primary">
            <AvatarInitial :name="resolveTranslatedValue(store.currentUser.name)" size="xl" />
          </div>
          <div class="sm:pb-1 flex-1">
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(store.currentUser.name) }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ store.currentUser.email }}</p>
          </div>
          <button class="sm:self-end rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition">Edit Profile</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Personal Information</h2>
        <div class="space-y-3">
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Full Name</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ resolveTranslatedValue(store.currentUser.name) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Email</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ store.currentUser.email }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Phone</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ store.currentUser.phone || '—' }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Professional Info</h2>
        <div class="space-y-3">
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Role</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ store.currentUser.role || store.currentUser.position || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Department</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ store.currentUser.department || store.currentUser.departmentName || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Member Since</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ store.currentUser.joinedAt || store.currentUser.createdAt || '—' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
