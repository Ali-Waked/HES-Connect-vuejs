<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@/stores/workspace'
import { resolveTranslatedValue } from '@/utils/locale'

const emit = defineEmits(['close'])
const router = useRouter()
const { t } = useI18n()
const workspaceStore = useWorkspaceStore()

const searchQuery = ref('')
const searchInput = ref(null)

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

const showModal = computed(() =>
  workspaceStore.hasWorkspaces &&
  workspaceStore.hasMultipleWorkspaces &&
  !workspaceStore.currentWorkspace
)

function selectWorkspace(workspace) {
  workspaceStore.switchWorkspace(workspace)
  emit('close')
}

onMounted(() => {
  setTimeout(() => searchInput.value?.focus(), 100)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

        <div class="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div class="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-brand-primary/10 rounded-2xl">
              <span class="material-symbols-outlined text-[28px] text-brand-primary">business</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white text-center">
              {{ t('workspace.selectWorkspace', 'Select Your Workspace') }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
              {{ t('workspace.selectWorkspaceDesc', 'You have access to multiple facilities. Choose one to continue.') }}
            </p>
          </div>

          <div class="px-6 py-4">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                </svg>
              </span>
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                :placeholder="t('workspace.searchFacilities', 'Search facilities or roles...')"
                class="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-slate-900 dark:text-white placeholder-slate-400 transition"
              />
            </div>
          </div>

          <div class="max-h-80 overflow-y-auto px-3 pb-4">
            <div v-if="filteredWorkspaces.length === 0" class="py-8 text-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-2">search_off</span>
              <p class="text-sm text-slate-400 dark:text-slate-500">{{ t('workspace.noResults', 'No matching workspaces') }}</p>
            </div>

            <button
              v-for="workspace in filteredWorkspaces"
              :key="workspace.workspace_id"
              class="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-brand-primary/30 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-all duration-200 cursor-pointer group mb-2"
              @click="selectWorkspace(workspace)"
            >
              <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-brand-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <span class="material-symbols-outlined text-[22px]">business</span>
              </div>
              <div class="min-w-0 flex-1 text-left">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
                    {{ resolveTranslatedValue(workspace.facility?.name) }}
                  </p>
                  <span
                    v-if="workspace.facility?.type"
                    class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  >
                    {{ workspace.facility.type }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ resolveTranslatedValue(workspace.role?.name) }}
                </p>
              </div>
              <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-brand-primary transition-colors shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
