<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { resolveTranslatedValue } from '@/utils/locale'
import { useDashboardStore } from '@/stores/dashboard'
import axiosClient from '@/axiosClient'
import TipTapEditor from '@/components/dashboard/global/TipTapEditor.vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  article: { type: Object, default: null }
})

const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { localField } = useLocaleField()
const dashboardStore = useDashboardStore()

const contentTab = ref('en')
const title_en = ref('')
const title_ar = ref('')
const content_en = ref('')
const content_ar = ref('')
const category_id = ref('')
const status = ref('pending_review')
const tags = ref([])
const cover_image = ref(null)
const cover_image_preview = ref('')
const loadingArticle = ref(false)
const saving = ref(false)
const allTags = ref([])
const allCategories = ref([])
const categorySearch = ref('')
const categoryOpen = ref(false)
const tagSearch = ref('')
const tagOpen = ref(false)
const tagResults = ref([])
const tagLoading = ref(false)
let tagSearchTimeout = null

const { locale } = useI18n()

const filteredCategories = computed(() => {
  let list = allCategories.value
  if (categorySearch.value.trim()) {
    const q = categorySearch.value.toLowerCase()
    list = list.filter(c => {
      const name = resolveTranslatedValue(c.name, locale.value).toLowerCase()
      return name.includes(q)
    })
  }
  return list
})

const selectedCategoryName = computed(() => {
  if (!category_id.value) return ''
  const cat = allCategories.value.find(c => (c.uuid || c.id) == category_id.value)
  return cat ? resolveTranslatedValue(cat.name, locale.value) : ''
})

function selectCategory(cat) {
  category_id.value = cat.uuid || cat.id
  categoryOpen.value = false
  categorySearch.value = ''
}

function clearCategory() {
  category_id.value = ''
  categoryOpen.value = false
  categorySearch.value = ''
}

const selectedTagsData = computed(() => {
  return tags.value.map(id => allTags.value.find(t => (t.uuid || t.id) === id)).filter(Boolean)
})

const filteredTagResults = computed(() => {
  return tagResults.value.filter(t => !tags.value.includes(t.uuid || t.id))
})

function getTagName(tag) {
  if (!tag?.name) return ''
  if (typeof tag.name === 'string') return tag.name
  return tag.name[locale.value] || tag.name.en || tag.name.ar || ''
}

async function searchTags(query) {
  clearTimeout(tagSearchTimeout)
  if (!query.trim()) {
    tagResults.value = []
    return
  }
  tagLoading.value = true
  tagSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await axiosClient.get('/tags', { params: { search: query } })
      tagResults.value = data.data || []
    } catch {
      tagResults.value = []
    } finally {
      tagLoading.value = false
    }
  }, 300)
}

function selectTag(tag) {
  const id = tag.uuid || tag.id
  if (!tags.value.includes(id)) {
    tags.value.push(id)
    if (!allTags.value.find(t => (t.uuid || t.id) === id)) {
      allTags.value.push(tag)
    }
  }
  tagSearch.value = ''
  tagResults.value = []
}

function removeTag(id) {
  tags.value = tags.value.filter(t => t !== id)
}

function closeTagDropdown(e) {
  if (!e.target.closest('.tag-selector')) {
    tagOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeTagDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeTagDropdown)
})

watch(() => props.show, async (val) => {
  if (val) {
    if (allTags.value.length === 0) {
      try {
        const { data } = await axiosClient.get('/tags', { params: { search: '', per_page: 100 } })
        allTags.value = data.data || []
      } catch { /* ignore */ }
    }
    if (allCategories.value.length === 0) {
      try {
        const { data } = await axiosClient.get('/categories/article')
        allCategories.value = data.data || data
      } catch { /* ignore */ }
    }
    if (props.article?.uuid) {
      loadingArticle.value = true
      try {
        const { data } = await axiosClient.get(`/staff/articles/${props.article.uuid}`)
        const a = data.data
        title_en.value = a.title?.en || ''
        title_ar.value = a.title?.ar || ''
        content_en.value = a.content?.en || ''
        content_ar.value = a.content?.ar || ''
        category_id.value = a.category?.uuid || a.category_id || ''
        status.value = a.status || 'draft'
        tags.value = a.tags?.map(t => t.uuid || t.id) || []
        cover_image.value = null
        cover_image_preview.value = a.cover_image || ''
      } catch {
        resetForm()
      } finally {
        loadingArticle.value = false
      }
    } else {
      resetForm()
    }
  }
})

function resetForm() {
  title_en.value = ''
  title_ar.value = ''
  content_en.value = ''
  content_ar.value = ''
  category_id.value = ''
  status.value = 'pending_review'
  tags.value = []
  cover_image.value = null
  cover_image_preview.value = ''
  contentTab.value = 'en'
}

function onCoverImageChange(e) {
  const file = e.target.files[0]
  if (file) {
    cover_image.value = file
    cover_image_preview.value = URL.createObjectURL(file)
  }
}

function removeCoverImage() {
  cover_image.value = null
  cover_image_preview.value = ''
}

async function submitForm() {
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('title[en]', title_en.value)
    fd.append('title[ar]', title_ar.value)
    fd.append('content[en]', content_en.value || '')
    fd.append('content[ar]', content_ar.value || '')
    fd.append('category_id', category_id.value)
    fd.append('status', status.value)
    tags.value.forEach(id => fd.append('tags[]', id))
    if (cover_image.value) fd.append('cover_image', cover_image.value)

    if (props.article?.uuid) {
      fd.append('_method', 'PUT')
      await axiosClient.post(`/staff/articles/${props.article.uuid}`, fd)
      dashboardStore.addToast(t('articles.updated') || 'Article updated successfully', 'success')
    } else {
      await axiosClient.post('/staff/articles', fd)
      dashboardStore.addToast(t('articles.created') || 'Article created successfully', 'success')
    }
    emit('saved')
    emit('close')
  } catch (err) {
    dashboardStore.addToast(err.response?.data?.message || 'Failed to save article', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
  <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ article?.uuid ? $t('articles.editArticle') : $t('articles.newArticle') }}
        </h3>
        <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="flex flex-col flex-1 overflow-hidden">
        <div v-if="loadingArticle" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
          <div>
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Basic Information
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('articles.title_en') }} *</label>
                <input type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition" required dir="ltr" v-model="title_en" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('articles.title_ar') }} *</label>
                <input type="text" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition text-right" required dir="rtl" v-model="title_ar" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('articles.category') }} *</label>
              <div class="relative">
                <div
                  class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-between gap-2 cursor-pointer transition hover:border-slate-300 dark:hover:border-slate-600"
                  @click="categoryOpen = !categoryOpen"
                >
                  <span v-if="selectedCategoryName" class="truncate">{{ selectedCategoryName }}</span>
                  <span v-else class="text-slate-400 dark:text-slate-500 truncate">{{ $t('articles.selectCategory') || 'Select a category' }}</span>
                  <svg class="w-4 h-4 shrink-0 text-slate-400 transition" :class="{ 'rotate-180': categoryOpen }" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div v-if="categoryOpen" class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <div class="p-2 border-b border-slate-100 dark:border-slate-700">
                    <input
                      v-model="categorySearch"
                      type="text"
                      :placeholder="$t('common.search') || 'Search...'"
                      class="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <div class="max-h-48 overflow-y-auto">
                    <button type="button" class="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="clearCategory">
                      {{ $t('common.all') || 'All' }}
                    </button>
                    <button
                      v-for="cat in filteredCategories"
                      :key="cat.uuid || cat.id"
                      type="button"
                      class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                      :class="{ 'bg-brand-primary/5 dark:bg-brand-primary/10 font-semibold': (cat.uuid || cat.id) == category_id }"
                      @click="selectCategory(cat)"
                    >{{ resolveTranslatedValue(cat.name, locale) }}</button>
                    <div v-if="!filteredCategories.length" class="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      {{ $t('common.noResults') || 'No results found' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('articles.status') }}</label>
              <button type="button" @click="status = status === 'draft' ? 'pending_review' : 'draft'" class="flex items-center gap-3 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 transition cursor-pointer hover:border-slate-300 dark:hover:border-slate-600">
                <div class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out" :class="status === 'draft' ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'">
                  <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" :class="status === 'draft' ? 'translate-x-5' : 'translate-x-0.5'" />
                </div>
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ status === 'draft' ? $t('statuses.draft') : $t('statuses.pending_review') }}</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('articles.coverImage') || 'Cover Image' }}</label>
            <div v-if="cover_image_preview" class="relative group">
              <img :src="cover_image_preview" class="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
              <button type="button" @click="removeCoverImage" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <label v-else class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary transition">
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p class="text-xs text-slate-500">{{ $t('articles.clickToUpload') || 'Click to upload cover image' }}</p>
              </div>
              <input type="file" class="hidden" accept="image/*" @change="onCoverImageChange" />
            </label>
          </div>

          <div>
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Article Content
            </h4>
            <div class="flex gap-1 mb-3">
              <button type="button" @click="contentTab = 'en'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer" :class="contentTab === 'en' ? 'bg-brand-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">English</button>
              <button type="button" @click="contentTab = 'ar'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer" :class="contentTab === 'ar' ? 'bg-brand-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">العربية</button>
            </div>
            <div v-show="contentTab === 'en'">
              <TipTapEditor v-model="content_en" placeholder="Write your article in English..." dir="ltr" />
            </div>
            <div v-show="contentTab === 'ar'">
              <TipTapEditor v-model="content_ar" placeholder="اكتب مقالتك باللغة العربية..." dir="rtl" />
            </div>
          </div>

          <div class="space-y-2 tag-selector relative">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.tags') }}</label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="tag in selectedTagsData"
                :key="tag.uuid || tag.id"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[11px] font-bold rounded-full border border-brand-primary/20"
              >
                #{{ getTagName(tag) }}
                <button type="button" @click="removeTag(tag.uuid || tag.id)" class="hover:text-rose-500 transition-colors cursor-pointer">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            </div>
            <div class="relative">
              <div class="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/10 transition">
                <svg class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>
                <input
                  v-model="tagSearch"
                  type="text"
                  placeholder="Search tags..."
                  class="flex-grow bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  @input="searchTags(tagSearch)"
                  @focus="tagOpen = true"
                />
                <svg v-if="tagLoading" class="w-4 h-4 text-brand-primary animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              </div>
              <div
                v-if="tagOpen && filteredTagResults.length > 0"
                class="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto py-2"
              >
                <button
                  v-for="tag in filteredTagResults"
                  :key="tag.uuid || tag.id"
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-primary flex items-center justify-between group transition-colors cursor-pointer"
                  @click="selectTag(tag)"
                >
                  <span>#{{ getTagName(tag) }}</span>
                  <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 text-brand-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                </button>
              </div>
              <div
                v-else-if="tagOpen && tagSearch && !tagLoading && filteredTagResults.length === 0"
                class="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-4 text-center"
              >
                <p class="text-xs text-slate-400 dark:text-slate-500">No tags found</p>
              </div>
            </div>
          </div>
        </div>

        <div v-show="!loadingArticle" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" :disabled="saving" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer">
            <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {{ $t('articles.saveAsDraft') || 'Save as Draft' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  </Teleport>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
