<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useArticles } from '../../../composables/useArticles';
import { getTags } from '../../../services/articleService';
import CategorySelect from '../../shared/CategorySelect.vue';
import TagSelector from '../global/TagSelector.vue';
import TipTapEditor from '../global/TipTapEditor.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  article: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { createArticle, updateArticle, fetchArticle, saving } = useArticles();

const contentTab = ref('en');

const title_en = ref('');
const title_ar = ref('');
const content_en = ref('');
const content_ar = ref('');
const category_id = ref('');
const status = ref('draft');
const tags = ref([]);
const cover_image = ref(null);
const cover_image_preview = ref('');
const loadingArticle = ref(false);

const allTags = ref([]);

watch(() => props.show, async (val) => {
  if (val && allTags.value.length === 0) {
    try {
      const { data } = await getTags()
      allTags.value = data.data || data
    } catch (e) {
      // silently fail
    }
  }
});

watch(
  () => props.article,
  async (newArticle) => {
    loadingArticle.value = false;
    if (newArticle && newArticle.uuid) {
      loadingArticle.value = true;
      try {
        const data = await fetchArticle(newArticle.uuid);
        title_en.value = data.title?.en || '';
        title_ar.value = data.title?.ar || '';
        content_en.value = data.content?.en || '';
        content_ar.value = data.content?.ar || '';
        category_id.value = data.category?.uuid || data.category_id || '';
        status.value = data.status || 'draft';
        tags.value = data.tags?.map(t => t.uuid || t.id) || [];
        cover_image.value = null;
        cover_image_preview.value = data.cover_image || '';
      } catch (err) {
        resetForm();
      } finally {
        loadingArticle.value = false;
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  title_en.value = '';
  title_ar.value = '';
  content_en.value = '';
  content_ar.value = '';
  category_id.value = '';
  status.value = 'draft';
  tags.value = [];
  cover_image.value = null;
  cover_image_preview.value = '';
  contentTab.value = 'en';
}

function onCoverImageChange(e) {
  const file = e.target.files[0];
  if (file) {
    cover_image.value = file;
    cover_image_preview.value = URL.createObjectURL(file);
  }
}

function removeCoverImage() {
  cover_image.value = null;
  cover_image_preview.value = '';
}

const submitForm = async () => {
  const data = {
    title_en: title_en.value,
    title_ar: title_ar.value,
    content_en: content_en.value,
    content_ar: content_ar.value,
    category_id: category_id.value,
    status: status.value,
    tags: tags.value,
    cover_image: cover_image.value,
  };

  let result;
  if (props.article && props.article.uuid) {
    result = await updateArticle(props.article.uuid, data);
  } else {
    result = await createArticle(data);
  }

  if (result.success) {
    emit('close');
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ article && article.uuid ? $t('articles.editArticle') : $t('articles.newArticle') }}
        </h3>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
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
              <CategorySelect v-model="category_id" type="article" :placeholder="$t('articles.selectCategory') || 'Select a category'" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('articles.status') }}</label>
              <select class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition cursor-pointer" v-model="status">
                <option value="draft">{{ $t('statuses.draft') }}</option>
                <option value="pending_review">{{ $t('statuses.pending_review') }}</option>
                <option value="published">{{ $t('statuses.published') }}</option>
                <option value="archived">{{ $t('statuses.archived') }}</option>
                <option value="rejected">{{ $t('statuses.rejected') }}</option>
              </select>
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

          <TagSelector v-model="tags" :tags="allTags" :label="$t('articles.tags')" />
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
            {{ article && article.uuid ? $t('common.save') : $t('articles.newArticle') }}
          </button>
        </div>
      </form>
    </div>
  </div>
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
