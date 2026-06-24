<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMedicinesStore } from '@/stores/medicines'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFormatDate } from '@/composables/useFormatDate'
import BaseLoading from '@/components/dashboard/global/BaseLoading.vue'
import ConfirmModal from '@/components/dashboard/global/ConfirmModal.vue'
import { ref } from 'vue'

const props = defineProps({ uuid: { type: String, required: true } })

const router = useRouter()
const { t } = useI18n()
const store = useMedicinesStore()
const { localField } = useLocaleField()
const { formatDate } = useFormatDate()

const showDeleteConfirm = ref(false)

onMounted(() => {
  store.fetchMedicine(props.uuid)
})

const item = computed(() => store.medicine)

const imageSrc = computed(() => {
  if (!item.value?.image) return null
  return item.value.image
})

async function handleDelete() {
  const result = await store.deleteMedicine(props.uuid)
  showDeleteConfirm.value = false
  if (result.success) {
    router.push('/platform/medicines')
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <button
          @click="router.push('/platform/medicines')"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition mb-4 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Medicines
        </button>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight" v-if="item">{{ localField(item, 'name') }}</h1>
      </div>

      <div class="flex items-center gap-2" v-if="item">
        <button
          @click="router.push(`/platform/medicines/${props.uuid}/edit`)"
          class="inline-flex items-center gap-2 py-2.5 px-5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold rounded-lg transition cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          @click="showDeleteConfirm = true"
          class="inline-flex items-center gap-2 py-2.5 px-5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow-md shadow-red-500/15 transition cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>

    <BaseLoading v-if="store.loading" message="Loading medicine details..." />

    <div v-else-if="store.errors.general" class="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
      <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ store.errors.general }}</p>
    </div>

    <div v-else-if="item" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="relative aspect-video bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <img v-if="imageSrc" :src="imageSrc" class="w-full h-full object-contain p-8" />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
          <span class="material-symbols-outlined text-7xl">medical_services</span>
          <p class="text-sm font-medium mt-2">No image available</p>
        </div>
      </div>

      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ localField(item, 'name') }}</h2>
          <p class="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-widest">UUID: {{ item.uuid }}</p>
        </div>

        <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">About this Medicine</label>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ localField(item, 'description') || 'No description provided.' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
            <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Added On</label>
            <p class="text-xs font-bold text-slate-900 dark:text-white">{{ formatDate(item.created_at) }}</p>
          </div>
          <div class="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
            <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Last Updated</label>
            <p class="text-xs font-bold text-slate-900 dark:text-white">{{ formatDate(item.updated_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Delete Medicine"
      :message="`Are you sure you want to delete <strong>${item ? localField(item, 'name') : ''}</strong>? This action cannot be undone.`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
