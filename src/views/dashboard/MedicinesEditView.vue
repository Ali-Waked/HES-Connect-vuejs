<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMedicinesStore } from '@/stores/medicines'
import ImageUploader from '@/components/dashboard/global/ImageUploader.vue'
import BaseLoading from '@/components/dashboard/global/BaseLoading.vue'

const props = defineProps({ uuid: { type: String, required: true } })

const router = useRouter()
const { t } = useI18n()
const store = useMedicinesStore()

const form = reactive({
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  image: null,
})

const localErrors = ref({})
const dataLoaded = ref(false)

onMounted(async () => {
  await store.fetchMedicine(props.uuid)
  if (store.medicine) {
    const m = store.medicine
    form.name_en = m.name?.en || m.name_en || ''
    form.name_ar = m.name?.ar || m.name_ar || ''
    form.description_en = m.description?.en || m.description_en || ''
    form.description_ar = m.description?.ar || m.description_ar || ''
    form.image = m.image || null
    dataLoaded.value = true
  }
})

async function handleSubmit() {
  localErrors.value = {}

  if (!form.name_en.trim()) localErrors.value.name_en = t('common.required')
  if (!form.name_ar.trim()) localErrors.value.name_ar = t('common.required')

  if (Object.keys(localErrors.value).length > 0) return

  const result = await store.updateMedicine(props.uuid, { ...form })

  if (result.success) {
    router.push(`/platform/medicines/${props.uuid}`)
  }
}

function fieldError(field) {
  return localErrors.value[field] || store.errors[field]?.[0] || ''
}

const hasApiError = computed(() => store.errors.general)
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8 animate-fade-in">
    <div>
      <button
        @click="router.push(`/platform/medicines/${props.uuid}`)"
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition mb-4 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Details
      </button>
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('medicines.editMedicine') }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Update medication details in the pharmaceutical registry</p>
    </div>

    <BaseLoading v-if="store.loading && !dataLoaded" message="Loading medicine..." />

    <div v-else-if="!store.medicine && !store.loading" class="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
      <p class="text-sm font-medium text-red-700 dark:text-red-400">Medicine not found</p>
    </div>

    <template v-else-if="dataLoaded">
      <div v-if="hasApiError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ store.errors.general }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Name (English) *</label>
            <input
              v-model="form.name_en"
              type="text"
              placeholder="Medicine name in English"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
            />
            <p v-if="fieldError('name_en')" class="text-xs text-rose-500 mt-1">{{ fieldError('name_en') }}</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Name (Arabic) *</label>
            <input
              v-model="form.name_ar"
              type="text"
              placeholder="اسم الدواء بالعربية"
              dir="rtl"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
            />
            <p v-if="fieldError('name_ar')" class="text-xs text-rose-500 mt-1">{{ fieldError('name_ar') }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description (English)</label>
          <textarea
            v-model="form.description_en"
            placeholder="Medicine description in English"
            rows="3"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description (Arabic)</label>
          <textarea
            v-model="form.description_ar"
            placeholder="وصف الدواء بالعربية"
            dir="rtl"
            rows="3"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition resize-none"
          ></textarea>
        </div>

        <ImageUploader v-model="form.image" label="Medicine Image" />

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="router.push(`/platform/medicines/${props.uuid}`)"
            class="py-2.5 px-6 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold rounded-lg transition cursor-pointer"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="store.saving"
            class="inline-flex items-center justify-center gap-2 py-2.5 px-8 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            <svg v-if="store.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ store.saving ? 'Saving...' : t('common.save') }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
