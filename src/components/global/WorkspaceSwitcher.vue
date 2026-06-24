<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@/stores/workspace'
import { resolveTranslatedValue } from '@/utils/locale'

const emit = defineEmits(['close'])
const router = useRouter()
const { t } = useI18n()
const workspaceStore = useWorkspaceStore()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)

const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
const workspaces = computed(() => workspaceStore.availableWorkspaces)

const filteredWorkspaces = computed(() => {
  if (!searchQuery.value) return workspaces.value
  const q = searchQuery.value.toLowerCase()
  return workspaces.value.filter(w =>
    resolveTranslatedValue(w.facility?.name)?.toLowerCase().includes(q) ||
    resolveTranslatedValue(w.role?.name)?.toLowerCase().includes(q) ||
    w.facility?.type?.toLowerCase().includes(q)
  )
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    setTimeout(() => searchInput.value?.focus(), 50)
  }
}

function selectWorkspace(workspace) {
  workspaceStore.switchWorkspace(workspace)
  isOpen.value = false
  searchQuery.value = ''
  emit('close')
}

function handleClickOutside(e) {
  if (!e.target.closest('[data-workspace-switcher]')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div v-if="workspaces.length > 0" class="relative" data-workspace-switcher>
    <button
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
      :class="isOpen
        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
        : 'text-slate-600 dark:text-slate-400'"
      @click.stop="toggleDropdown"
    >
      <span class="material-symbols-outlined text-[18px]">business</span>
      <span class="hidden md:inline truncate max-w-[180px]">
        {{ resolveTranslatedValue(currentWorkspace?.facility?.name) || 'Select Workspace' }}
      </span>
      <span class="hidden lg:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary">
        {{ resolveTranslatedValue(currentWorkspace?.role?.name) }}
      </span>
      <svg
        class="w-3 h-3 transition-transform duration-200 shrink-0"
        :class="isOpen ? 'rotate-180' : ''"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
      >
        <path stroke-linecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
      </svg>
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-[100] overflow-hidden"
        @click.stop
      >
        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {{ t('workspace.switchWorkspace', 'Switch Workspace') }}
          </p>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2.5">
              <svg class="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
            </span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="t('workspace.search', 'Search facilities or roles...')"
              class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div class="max-h-64 overflow-y-auto py-1.5">
          <div v-if="filteredWorkspaces.length === 0" class="px-4 py-6 text-center">
            <span class="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 block mb-2">search_off</span>
            <p class="text-sm text-slate-400 dark:text-slate-500">{{ t('workspace.noResults', 'No matching workspaces') }}</p>
          </div>

          <button
            v-for="workspace in filteredWorkspaces"
            :key="workspace.workspace_id"
            class="w-full flex items-center gap-3 px-4 py-3 text-left transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
            :class="currentWorkspace?.workspace_id === workspace.workspace_id ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''"
            @click="selectWorkspace(workspace)"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :class="currentWorkspace?.workspace_id === workspace.workspace_id
                ? 'bg-brand-primary text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
            >
              <span class="material-symbols-outlined text-[20px]">business</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {{ resolveTranslatedValue(workspace.facility?.name) }}
                </p>
                <span
                  v-if="workspace.facility?.type"
                  class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                >
                  {{ workspace.facility.type }}
                </span>
                <span
                  v-if="currentWorkspace?.workspace_id === workspace.workspace_id"
                  class="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary text-white"
                >
                  <svg class="w-2.5 h-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ resolveTranslatedValue(workspace.role?.name) }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
