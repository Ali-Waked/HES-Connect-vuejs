<script setup>
import { watch, computed } from 'vue'
import { useStaffPermissions } from '@/composables/useStaffPermissions'
import { usePermissionHelper } from '@/composables/usePermissionHelper'

const props = defineProps({
  show: { type: Boolean, required: true },
  staffMember: { type: Object, default: null },
  staffUuid: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const { getPermissionName, getPermissionKey } = usePermissionHelper()
const { loading, updating, error, permissions, fetchPermissions, togglePermission } = useStaffPermissions()

const groupedPermissions = computed(() => {
  const groups = {}
  permissions.value.forEach((p) => {
    const group = (getPermissionKey(p).split(':')[0] || getPermissionKey(p).split('.')[0] || 'other').toLowerCase()
    if (!groups[group]) groups[group] = []
    groups[group].push(p)
  })
  return groups
})

function titleCase(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

async function handleToggle(permission) {
  await togglePermission(props.staffUuid, permission, !permission.enabled)
}

watch(
  () => props.show,
  (val) => {
    if (val && props.staffUuid) {
      fetchPermissions(props.staffUuid)
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-2xl mx-4 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Staff Permissions</h3>
            <p v-if="staffMember" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {{ staffMember.user?.name || staffMember.name || '' }}
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            @click="emit('close')"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto grow">
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 4" :key="i" class="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-700 animate-pulse">
              <div class="space-y-2">
                <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
          </div>

          <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
            <span class="material-symbols-outlined text-4xl text-rose-400 mb-3">error_outline</span>
            <p class="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1">Failed to load permissions</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
            <button
              class="text-xs font-bold text-brand-primary hover:underline transition cursor-pointer"
              @click="fetchPermissions(staffUuid)"
            >
              Try again
            </button>
          </div>

          <div v-else-if="permissions.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">lock</span>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">No permissions available</p>
          </div>

          <div v-else class="space-y-6">
            <div v-for="(perms, group) in groupedPermissions" :key="group" class="space-y-1">
              <h4 class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
                {{ titleCase(group) }}
              </h4>
              <div class="space-y-0.5">
                <label
                  v-for="perm in perms"
                  :key="perm.uuid"
                  class="flex items-center justify-between px-4 py-2.5 rounded-lg transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  :class="{
                    'bg-brand-primary/[0.03] dark:bg-brand-primary/[0.05]': perm.enabled,
                  }"
                >
                  <div class="min-w-0 flex-1 pr-4">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {{ getPermissionName(perm) }}
                    </p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                      {{ getPermissionKey(perm) }}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="perm.enabled"
                    :disabled="updating === perm.uuid"
                    class="relative inline-flex shrink-0 h-6 w-11 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="perm.enabled ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'"
                    @click="handleToggle(perm)"
                  >
                    <span
                      class="pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out flex items-center justify-center"
                      :class="perm.enabled ? 'translate-x-5' : 'translate-x-0'"
                    >
                      <span v-if="updating === perm.uuid" class="material-symbols-outlined text-[12px] text-slate-400 animate-spin">progress_activity</span>
                    </span>
                  </button>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 shrink-0 flex justify-end">
          <button
            class="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
