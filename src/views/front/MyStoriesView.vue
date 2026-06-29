<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import TipTapEditor from '../../components/dashboard/global/TipTapEditor.vue'
import { usePatientStories } from '../../composables/usePatientStories'
import { useCategories } from '@/composables/useCategories'
import CategorySelect from '@/components/shared/CategorySelect.vue'
import CategoryBadge from '@/components/shared/CategoryBadge.vue'
import { resolveTranslatedValue } from '@/utils/locale'

const { t } = useI18n()

const { categories, fetchCategories } = useCategories()
fetchCategories({ type: 'story', per_page: 100 })

const {
  stories, loading, saving, error, statusFilter, fundraisingOnly, pagination,
  fetchStories, saveStory, removeStory, setPage, setStatusFilter, toggleFundraisingOnly,
} = usePatientStories()

const tabs = [
  { key: 'all', label: () => t('myStories.all') },
  { key: 'pending', label: () => t('myStories.pending') },
  { key: 'approved', label: () => t('myStories.approved') },
  { key: 'rejected', label: () => t('myStories.rejected') },
]

const visiblePages = computed(() => {
  const total = pagination.last_page
  const current = pagination.current_page
  const pages = []
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showModal = ref(false)
const editingStory = ref(null)
const coverInput = ref(null)
const coverFile = ref(null)
const coverPreview = ref('')
const form = reactive({
  title_en: '',
  title_ar: '',
  content_ar: '',
  content_en: '',
  is_fundraising: false,
  target_amount: null,
  category_id: null,
})

function resetForm() {
  form.title_en = ''
  form.title_ar = ''
  form.content_ar = ''
  form.content_en = ''
  form.is_fundraising = false
  form.target_amount = null
  form.category_id = null
  coverFile.value = null
  coverPreview.value = ''
}

function closeModal() {
  showModal.value = false
  editingStory.value = null
  resetForm()
}

function onCoverFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  coverFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { coverPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

function removeCoverFile() {
  coverFile.value = null
  coverPreview.value = ''
}

function openCreateModal() {
  resetForm()
  editingStory.value = null
  showModal.value = true
}

function openEditModal(story) {
  editingStory.value = story
  form.title_en = story.title?.en || ''
  form.title_ar = story.title?.ar || ''
  form.content_en = story.content?.en || ''
  form.content_ar = story.content?.ar || ''
  form.is_fundraising = !!story.is_fundraising
  form.target_amount = story.target_amount || null
  form.category_id = story.category_id || story.category?.id || story.category?.uuid || null
  coverFile.value = null
  coverPreview.value = story.cover_image || ''
  showModal.value = true
}

const validationError = ref('')

function validate() {
  if (!form.content_en && !form.content_ar) {
    validationError.value = t('myStories.validationContent')
    return false
  }
  if (form.is_fundraising && (!form.target_amount || form.target_amount <= 0)) {
    validationError.value = t('myStories.validationTarget')
    return false
  }
  validationError.value = ''
  return true
}

async function handleSave() {
  if (!validate()) return
  let payload
  if (coverFile.value) {
    payload = new FormData()
    payload.append('cover_image', coverFile.value)
    payload.append('is_fundraising', form.is_fundraising ? '1' : '0')
    payload.append('target_amount', form.is_fundraising && form.target_amount ? String(form.target_amount) : '')
    if (form.title_en) payload.append('title[en]', form.title_en)
    if (form.title_ar) payload.append('title[ar]', form.title_ar)
    if (form.content_en) payload.append('content[en]', form.content_en)
    if (form.content_ar) payload.append('content[ar]', form.content_ar)
    if (form.category_id) payload.append('category_id', String(form.category_id))
    if (editingStory.value?.id) payload.append('_method', 'PUT')
  } else {
    payload = {
      title: {},
      content: {},
      is_fundraising: form.is_fundraising,
      target_amount: form.is_fundraising ? form.target_amount : null,
    }
    if (form.title_en) payload.title.en = form.title_en
    if (form.title_ar) payload.title.ar = form.title_ar
    if (form.content_en) payload.content.en = form.content_en
    if (form.content_ar) payload.content.ar = form.content_ar
    if (form.category_id) payload.category_id = form.category_id
    if (editingStory.value?.id) payload._method = 'PUT'
  }
  const ok = await saveStory(payload, editingStory.value?.id || null)
  if (ok) closeModal()
  else validationError.value = error.value || t('myStories.saveError')
}

const showDeleteConfirm = ref(false)
const deletingStory = ref(null)

function handleDelete(story) {
  deletingStory.value = story
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deletingStory.value) return
  await removeStory(deletingStory.value.id)
  showDeleteConfirm.value = false
  deletingStory.value = null
}

const drawerOpen = ref(false)
const drawerStory = ref(null)

function openDetailDrawer(story) {
  drawerStory.value = story
  drawerOpen.value = true
}

function closeDetailDrawer() {
  drawerOpen.value = false
  drawerStory.value = null
}

function formatDate(dateStr) {
  if (!dateStr) return '\u2014'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusBadgeClass(status) {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
  }
}

function progressPercent(story) {
  if (!story.target_amount || story.target_amount <= 0) return 0
  return Math.min(100, ((story.collected_amount || 0) / story.target_amount) * 100)
}

function formatCurrency(amount) {
  return '$' + Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function storyCategory(story) {
  if (!story.category_id && !story.category) return null
  const catId = story.category_id || story.category?.id || story.category?.uuid
  if (!catId) return null
  return categories.value.find(c => (c.uuid || c.id) == catId) || (story.category || null)
}

onMounted(fetchStories)
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">{{ $t('myStories.title') }}</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ $t('myStories.description') }}</p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer"
          @click="openCreateModal"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          {{ $t('myStories.addStory') }}
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div class="flex gap-2 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition cursor-pointer"
            :class="(statusFilter || 'all') === tab.key
              ? 'bg-brand-primary text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
            @click="setStatusFilter(tab.key === 'all' ? '' : tab.key)"
          >{{ tab.label() }}</button>
        </div>
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer shrink-0">
          <input type="checkbox" :checked="fundraisingOnly" @change="toggleFundraisingOnly($event.target.checked)" class="rounded border-slate-300 dark:border-slate-600 text-brand-primary focus:ring-brand-primary/30 cursor-pointer" />
          {{ $t('myStories.fundraisingOnly') }}
        </label>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div class="flex-1 space-y-3">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
        <svg class="w-12 h-12 mx-auto text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
        </svg>
        <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        <button class="mt-3 text-sm font-semibold text-brand-primary cursor-pointer" @click="fetchStories">{{ $t('myStories.retry') }}</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!stories.length" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('myStories.noStories') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ $t('myStories.noStoriesDesc') }}</p>
        <button
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer"
          @click="openCreateModal"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          {{ $t('myStories.createFirst') }}
        </button>
      </div>

      <!-- Stories List -->
      <div v-else class="space-y-3">
        <div
          v-for="story in stories"
          :key="story.id"
          class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div v-if="story.cover_image" class="mb-3 -mx-5 -mt-5 rounded-t-xl overflow-hidden h-40">
                <img :src="story.cover_image" class="w-full h-full object-cover" alt="" />
              </div>
              <div class="flex items-center gap-3 mb-1 flex-wrap">
                <span
                  class="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="statusBadgeClass(story.status)"
                >{{ $t('myStories.' + story.status) || story.status }}</span>
                <CategoryBadge v-if="storyCategory(story)" :category="storyCategory(story)" size="xs" />
                <span v-if="story.is_fundraising" class="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  {{ $t('myStories.fundraiser') }}
                </span>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ formatDate(story.created_at) }}
              </p>
              <p v-if="story.title" class="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {{ story.title.en || story.title.ar || '' }}
              </p>
              <div v-if="story.content" class="mt-1 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div v-if="story.content.en" class="line-clamp-2" v-html="story.content.en"></div>
                <div v-if="story.content.ar" class="line-clamp-2" dir="rtl" v-html="story.content.ar"></div>
              </div>

              <!-- Fundraising Progress -->
              <div v-if="story.is_fundraising && story.target_amount" class="mt-3 max-w-sm">
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{{ formatCurrency(story.collected_amount || 0) }} {{ $t('myStories.raised') }} {{ $t('myStories.of') }} {{ formatCurrency(story.target_amount) }}</span>
                  <span>{{ Math.round(progressPercent(story)) }}%</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-brand-primary transition-all duration-500"
                    :style="{ width: progressPercent(story) + '%' }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              class="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              @click="openDetailDrawer(story)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                <path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ $t('myStories.viewDetails') }}
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              @click="openEditModal(story)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
              </svg>
              {{ $t('myStories.editStory') }}
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
              @click="handleDelete(story)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
              </svg>
              {{ $t('myStories.delete') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="flex items-center justify-center gap-2 mt-8">
        <button
          :disabled="pagination.current_page <= 1"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page - 1)"
        >{{ $t('myStories.prev') }}</button>
        <div class="flex items-center gap-1">
          <button
            v-for="p in visiblePages"
            :key="p"
            class="w-9 h-9 rounded-lg text-sm font-semibold transition cursor-pointer"
            :class="p === pagination.current_page ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'"
            @click="setPage(p)"
          >{{ p }}</button>
        </div>
        <button
          :disabled="pagination.current_page >= pagination.last_page"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page + 1)"
        >{{ $t('myStories.next') }}</button>
      </div>
    </main>

    <LandingFooter />

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal" />
          <div class="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white dark:bg-slate-800 z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between rounded-t-2xl">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                {{ editingStory ? $t('myStories.editStoryTitle') : $t('myStories.addStoryTitle') }}
              </h3>
              <button class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer" @click="closeModal">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-5">
              <div v-if="validationError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {{ validationError }}
              </div>

              <!-- Title English -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{{ $t('myStories.titleEn') }}</label>
                <input
                  v-model="form.title_en"
                  type="text"
                  class="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg"
                  style="border: none; outline: none;"
                  :placeholder="$t('myStories.titleEnPlaceholder')"
                />
              </div>

              <!-- Title Arabic -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{{ $t('myStories.titleAr') }}</label>
                <input
                  v-model="form.title_ar"
                  type="text"
                  dir="rtl"
                  class="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg"
                  style="border: none; outline: none;"
                  :placeholder="$t('myStories.titleArPlaceholder')"
                />
              </div>

              <!-- Cover Image -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{{ $t('myStories.coverImage') }}</label>
                <div
                  class="relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-4 text-center transition hover:border-brand-primary/50 cursor-pointer"
                  @click="coverInput?.click()"
                >
                  <input
                    ref="coverInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onCoverFileChange"
                  />
                  <template v-if="coverPreview">
                    <img :src="coverPreview" class="max-h-48 mx-auto rounded-lg object-cover" alt="Cover preview" />
                    <div class="flex justify-center gap-2 mt-3">
                      <button
                        type="button"
                        class="text-xs font-semibold text-brand-primary hover:text-brand-primary-dark cursor-pointer"
                        @click.stop="coverInput?.click()"
                      >{{ $t('myStories.coverImageChange') }}</button>
                      <button
                        type="button"
                        class="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                        @click.stop="removeCoverFile"
                      >{{ $t('myStories.coverImageRemove') }}</button>
                    </div>
                  </template>
                  <template v-else>
                    <svg class="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
                    </svg>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('myStories.coverImagePlaceholder') }}</p>
                  </template>
                </div>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{{ $t('myStories.category') || 'Category' }}</label>
                <CategorySelect v-model="form.category_id" type="story" :placeholder="$t('myStories.selectCategory') || 'Select a category'" />
              </div>

              <!-- Content English -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{{ $t('myStories.contentEn') }}</label>
                <TipTapEditor v-model="form.content_en" :placeholder="$t('myStories.contentEnPlaceholder')" no-focus-border />
              </div>

              <!-- Content Arabic -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{{ $t('myStories.contentAr') }}</label>
                <TipTapEditor v-model="form.content_ar" :placeholder="$t('myStories.contentArPlaceholder')" dir="rtl" no-focus-border />
              </div>

              <!-- Fundraising Toggle -->
              <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ $t('myStories.fundraisingLabel') }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('myStories.fundraisingDesc') }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="form.is_fundraising" class="sr-only peer" />
                  <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-brand-primary peer-focus:ring-2 peer-focus:ring-brand-primary/30 transition after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <!-- Target Amount -->
              <div v-if="form.is_fundraising">
                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{{ $t('myStories.targetAmount') }}</label>
                <input
                  v-model.number="form.target_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  style="border: none; outline: none;"
                  :placeholder="$t('myStories.targetAmountPlaceholder')"
                />
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="sticky bottom-0 bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
              <button
                class="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                @click="closeModal"
              >{{ $t('myStories.cancel') }}</button>
              <button
                class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="saving || (!form.content_en && !form.content_ar)"
                @click="handleSave"
              >
                <span v-if="saving" class="inline-flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {{ $t('myStories.saving') }}
                </span>
                <span v-else>{{ editingStory ? $t('myStories.update') : $t('myStories.submit') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Detail Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawerOpen && drawerStory" class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" @click="closeDetailDrawer" />
          <div class="relative w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 h-full overflow-y-auto scrollbar-hide">
            <div class="sticky top-0 bg-white dark:bg-slate-800 z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ $t('myStories.storyDetails') }}</h3>
              <button class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer" @click="closeDetailDrawer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6 space-y-5">
              <div v-if="drawerStory.cover_image" class="-mx-6 -mt-5 mb-2 h-48 overflow-hidden">
                <img :src="drawerStory.cover_image" class="w-full h-full object-cover" alt="" />
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="statusBadgeClass(drawerStory.status)"
                >{{ $t('myStories.' + drawerStory.status) || drawerStory.status }}</span>
                <CategoryBadge v-if="storyCategory(drawerStory)" :category="storyCategory(drawerStory)" size="xs" />
                <span v-if="drawerStory.is_fundraising" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {{ $t('myStories.fundraiser') }}
                </span>
              </div>

              <div class="text-xs text-slate-500 dark:text-slate-400">
                {{ $t('myStories.submittedOn') }} {{ formatDate(drawerStory.created_at) }}
              </div>

              <p v-if="drawerStory.title?.en || drawerStory.title?.ar" class="text-lg font-bold text-slate-900 dark:text-white">
                {{ drawerStory.title.en || drawerStory.title.ar }}
              </p>

              <div v-if="drawerStory.content?.en" class="prose prose-sm dark:prose-invert max-w-none" v-html="drawerStory.content.en" />
              <div v-if="drawerStory.content?.ar" class="prose prose-sm dark:prose-invert max-w-none mt-4" dir="rtl" v-html="drawerStory.content.ar" />

              <!-- Fundraising -->
              <div v-if="drawerStory.is_fundraising && drawerStory.target_amount" class="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <p class="text-sm font-bold text-amber-800 dark:text-amber-300">{{ $t('myStories.fundraisingLabel') }}</p>
                <div class="mt-2">
                  <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>{{ formatCurrency(drawerStory.collected_amount || 0) }} {{ $t('myStories.raised') }} {{ $t('myStories.of') }} {{ formatCurrency(drawerStory.target_amount) }}</span>
                    <span>{{ Math.round(progressPercent(drawerStory)) }}%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div class="h-full rounded-full bg-brand-primary transition-all duration-500" :style="{ width: progressPercent(drawerStory) + '%' }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showDeleteConfirm = false" />
          <div class="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ $t('myStories.deleteTitle') }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ $t('myStories.deleteDesc') }}</p>
            <div class="flex gap-3 justify-center mt-6">
              <button class="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="showDeleteConfirm = false">{{ $t('myStories.cancel') }}</button>
              <button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition cursor-pointer" @click="confirmDelete">{{ $t('myStories.deleteConfirm') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.25s ease;
}
.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from > div:last-child,
.modal-fade-leave-to > div:last-child {
  transform: scale(0.95);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
