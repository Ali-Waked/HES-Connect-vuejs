<script setup>
import { ref, watch, computed } from 'vue';
import { useDashboardStore } from '../../../stores/dashboard';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';

const props = defineProps({
  show: Boolean,
  job: Object,
  mode: { type: String, default: 'add' }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const { localField } = useLocaleField();
const store = useDashboardStore();

const formData = ref({
  facility: '',
  author: '',
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  status: 'pending',
  end_date: '',
  apply_method: 'email',
  apply_value: ''
});

const facilities = computed(() => store.facilities);

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.mode === 'edit' && props.job) {
      formData.value = { 
        ...props.job,
        title_en: props.job.title_en || '',
        title_ar: props.job.title_ar || '',
        description_en: props.job.description_en || '',
        description_ar: props.job.description_ar || '',
      };
    } else {
      formData.value = {
        facility: facilities.value[0]?.name_en || '',
        author: '',
        title_en: '',
        title_ar: '',
        description_en: '',
        description_ar: '',
        status: 'pending',
        end_date: '',
        apply_method: 'email',
        apply_value: ''
      };
    }
  }
});

const handleSubmit = () => {
  if (props.mode === 'edit') {
    store.updateJob(props.job.id, formData.value);
  } else {
    store.addJob(formData.value);
  }
  emit('close');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ mode === 'edit' ? $t('jobs.editJob') : $t('jobs.postJob') }}
        </h3>
        <button @click="$emit('close')" class="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Title English -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.title_en') }}</label>
            <input v-model="formData.title_en" type="text" required dir="ltr" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" :placeholder="$t('jobs.title_en')"/>
          </div>

          <!-- Title Arabic -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right block">{{ $t('jobs.title_ar') }}</label>
            <input v-model="formData.title_ar" type="text" required dir="rtl" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition text-right" :placeholder="$t('jobs.title_ar')"/>
          </div>

          <!-- Facility -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('facilities.title') }}</label>
            <select v-model="formData.facility" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
              <option v-for="f in facilities" :key="f.id" :value="f.name_en">{{ localField(f, 'name') }}</option>
            </select>
          </div>

          <!-- Author -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('articles.author') }}</label>
            <input v-model="formData.author" type="text" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" placeholder="Your name"/>
          </div>

          <!-- End Date -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.endDate') }}</label>
            <input v-model="formData.end_date" type="text" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" placeholder="e.g. Jul 15, 2026"/>
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.status') }}</label>
            <select v-model="formData.status" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
              <option value="pending">{{ $t('statuses.pending') }}</option>
              <option value="approved">{{ $t('statuses.approved') }}</option>
            </select>
          </div>

          <!-- Apply Method -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.applyMethod') }}</label>
            <select v-model="formData.apply_method" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition cursor-pointer">
              <option value="email">Email Address</option>
              <option value="link">External Link</option>
            </select>
          </div>

          <!-- Apply Value -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Apply Detail</label>
            <input v-model="formData.apply_value" type="text" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition" :placeholder="formData.apply_method === 'email' ? 'hr@example.com' : 'https://...'"/>
          </div>
        </div>

        <!-- Description English -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.description_en') }}</label>
          <textarea v-model="formData.description_en" required rows="3" dir="ltr" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition resize-none" :placeholder="$t('jobs.description_en')"></textarea>
        </div>

        <!-- Description Arabic -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right block">{{ $t('jobs.description_ar') }}</label>
          <textarea v-model="formData.description_ar" required rows="3" dir="rtl" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition resize-none text-right" :placeholder="$t('jobs.description_ar')"></textarea>
        </div>

        <!-- Footer -->
        <div class="pt-4 flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer">{{ $t('common.cancel') }}</button>
          <button type="submit" class="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-primary/20 transition cursor-pointer">
            {{ mode === 'edit' ? $t('common.save') : $t('jobs.postJob') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-in { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
