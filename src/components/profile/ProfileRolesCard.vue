<script setup>
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

const { locale } = useI18n()

defineProps({
  roles: { type: Array, default: () => [] },
  permissions: { type: Array, default: () => [] },
})

function permissionLabel(perm) {
  if (typeof perm === 'string') return perm
  return resolveTranslatedValue(perm.label || perm.name, locale.value) || perm.key || String(perm)
}

function permissionKey(perm) {
  if (typeof perm === 'string') return perm
  return perm.key || perm.name || String(perm)
}

function roleName(role) {
  if (typeof role === 'string') return role
  return resolveTranslatedValue(role.name, locale.value) || role.slug || ''
}
</script>

<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">Roles & Permissions</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Your access rights.</p>
    </div>

    <div class="p-6 space-y-5">
      <!-- Roles -->
      <div>
        <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Roles</p>
        <div v-if="roles.length" class="flex flex-wrap gap-2">
          <span
            v-for="role in roles"
            :key="typeof role === 'string' ? role : role.id"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-primary/10 text-brand-primary"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {{ roleName(role) }}
          </span>
        </div>
        <p v-else class="text-xs text-slate-400 italic">No roles assigned.</p>
      </div>

      <!-- Permissions -->
      <div v-if="permissions.length">
        <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Permissions</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(perm, idx) in permissions"
            :key="permissionKey(perm) + '-' + idx"
            class="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          >
            {{ permissionLabel(perm) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
