<script setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '../../../stores/dashboard';
import { useCategories } from '@/composables/useCategories';
import CategorySelect from '@/components/shared/CategorySelect.vue';
import CategoryBadge from '@/components/shared/CategoryBadge.vue';
import LocalizedInput from '@/components/shared/localized/LocalizedInput.vue'

const props = defineProps({
  show:  { type: Boolean, required: true },
  story: { type: Object, default: null },
  mode:  { type: String, default: 'add' } // 'add' | 'edit' | 'view'
});
const emit = defineEmits(['close']);

const store = useDashboardStore();
const { t: $t } = useI18n();
const { categories, fetchCategories } = useCategories();
fetchCategories({ type: 'story', per_page: 100 })

const activeMode = ref('add');
const title      = reactive({ en: '', ar: '' });
const patient    = ref('');
const status     = ref('Pending');
const fundraising = ref(false);
const goal       = ref(0);
const categoryId = ref(null);

watch(() => [props.show, props.story, props.mode], () => {
  activeMode.value = props.mode;
  if (props.story && (props.mode === 'edit' || props.mode === 'view')) {
    title.en = props.story.title?.en || props.story.title_en || '';
    title.ar = props.story.title?.ar || props.story.title_ar || '';
    patient.value    = props.story.patient;
    status.value     = props.story.status;
    fundraising.value = props.story.fundraising;
    goal.value       = props.story.goal || 0;
    categoryId.value = props.story.category_id || props.story.category?.id || props.story.category?.uuid || null;
  } else {
    title.en = ''; title.ar = ''; patient.value = ''; status.value = 'Pending'; fundraising.value = false; goal.value = 0; categoryId.value = null;
  }
}, { immediate: true });

const statusClass = (s) => ({
  'Approved': 'bg-emerald-100 text-emerald-700',
  'Pending':  'bg-amber-100 text-amber-700',
  'Rejected': 'bg-red-100 text-red-600',
}[s] || 'bg-slate-100 text-slate-600');

const submitForm = () => {
  const data = { title: { en: title.en, ar: title.ar }, patient: patient.value, status: status.value, fundraising: fundraising.value, goal: Number(goal.value) };
  if (categoryId.value) data.category_id = categoryId.value
  if (activeMode.value === 'edit' && props.story?.id) {
    store.updateStory(props.story.id, data);
  } else if (activeMode.value === 'add') {
    store.addStory(data);
  }
  emit('close');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-[520px] shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up overflow-hidden">

      <!-- Header -->
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          <span v-if="activeMode === 'view'">Story Details</span>
          <span v-else-if="activeMode === 'edit'">Edit Story</span>
          <span v-else>Add Story</span>
        </h3>
        <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- View Mode -->
      <div v-if="activeMode === 'view'" class="p-6 space-y-5">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ story?.title?.en || story?.title }}</h2>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(story?.status)">{{ story?.status }}</span>
            <CategoryBadge v-if="story?.category_id || story?.category" size="xs" :category="story.category || { id: story.category_id }" />
          </div>
        </div>
        <hr class="border-slate-100 dark:border-slate-700"/>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h4 class="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Patient</h4>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ story?.patient }}</p>
          </div>
          <div>
            <h4 class="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Images</h4>
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ story?.images }} uploaded</p>
          </div>
          <div>
            <h4 class="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Fundraising</h4>
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ story?.fundraising ? `$${story.raised?.toLocaleString()} raised of $${story.goal?.toLocaleString()}` : 'No' }}</p>
          </div>
          <div>
            <h4 class="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Submitted</h4>
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ story?.created }}</p>
          </div>
        </div>
        <div class="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button type="button" class="py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">Close</button>
          <button type="button" class="py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer" @click="activeMode = 'edit'">Edit Story</button>
        </div>
      </div>

      <!-- Add / Edit Form -->
      <form v-else @submit.prevent="submitForm">
        <div class="p-6 flex flex-col gap-4">
          <!-- Title -->
          <LocalizedInput v-model="title" field="title" :label="$t('stories.title_en')" required />
          <!-- Patient -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="sPatient">Patient Name *</label>
            <input id="sPatient" v-model="patient" type="text" required placeholder="e.g. Khalid Abu Amr" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"/>
          </div>
          <!-- Category -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('myStories.category') || 'Category' }}</label>
            <CategorySelect v-model="categoryId" type="story" :placeholder="$t('myStories.selectCategory') || 'Select a category'" />
          </div>
          <!-- Status -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="sStatus">Status *</label>
            <select id="sStatus" v-model="status" required class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer transition">
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <!-- Fundraising toggle -->
          <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <input id="sFund" v-model="fundraising" type="checkbox" class="w-4 h-4 rounded text-brand-primary accent-teal-600 cursor-pointer"/>
            <label for="sFund" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Enable Fundraising for this story</label>
          </div>
          <!-- Goal amount -->
          <div v-if="fundraising" class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="sGoal">Fundraising Goal (USD)</label>
            <input id="sGoal" v-model.number="goal" type="number" min="0" placeholder="e.g. 5000" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"/>
          </div>
        </div>
        <div class="p-4 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button type="button" class="py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">Cancel</button>
          <button type="submit" class="py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer">
            {{ activeMode === 'edit' ? 'Save Changes' : 'Create Story' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
</style>
