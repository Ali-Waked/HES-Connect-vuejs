<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCities } from '../../../../composables/useCities';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { fetchCity, updateCity, saving } = useCities();

const loadingCity = ref(true);
const name_en = ref('');
const name_ar = ref('');
const is_active = ref(true);
const validationErrors = ref({});

const uuid = route.params.uuid;

onMounted(async () => {
  try {
    const data = await fetchCity(uuid);
    name_en.value = data.name?.en || '';
    name_ar.value = data.name?.ar || '';
    is_active.value = data.is_active ?? true;
  } catch (err) {
    // Error handled by composable
  } finally {
    loadingCity.value = false;
  }
});

async function submitForm() {
  validationErrors.value = {};
  const data = {
    name_en: name_en.value,
    name_ar: name_ar.value,
    is_active: is_active.value,
  };

  const result = await updateCity(uuid, data);

  if (result.success) {
    router.push('/admin/cities');
  } else if (result.errors) {
    validationErrors.value = result.errors;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <div class="flex items-center gap-3">
      <router-link
        to="/admin/cities"
        class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer inline-flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </router-link>
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('cities.edit') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('cities.title') }}</p>
      </div>
    </div>

    <div v-if="loadingCity" class="flex items-center justify-center py-12">
      <svg class="w-8 h-8 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <form @submit.prevent="submitForm" class="p-6 flex flex-col gap-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="cityNameEn">{{ $t('cities.name_en') }} *</label>
            <input
              id="cityNameEn"
              type="text"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition"
              :class="{ 'border-rose-500 dark:border-rose-500': validationErrors['name.en'] }"
              required
              dir="ltr"
              :placeholder="$t('cities.name_en')"
              v-model="name_en"
            />
            <p v-if="validationErrors['name.en']" class="text-xs text-rose-600">{{ validationErrors['name.en'][0] }}</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="cityNameAr">{{ $t('cities.name_ar') }} *</label>
            <input
              id="cityNameAr"
              type="text"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none transition text-right"
              :class="{ 'border-rose-500 dark:border-rose-500': validationErrors['name.ar'] }"
              required
              dir="rtl"
              :placeholder="$t('cities.name_ar')"
              v-model="name_ar"
            />
            <p v-if="validationErrors['name.ar']" class="text-xs text-rose-600">{{ validationErrors['name.ar'][0] }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ $t('cities.status') }}</label>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                :value="true"
                v-model="is_active"
                class="w-4 h-4 text-brand-primary focus:ring-brand-primary"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300">{{ $t('cities.active') }}</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                :value="false"
                v-model="is_active"
                class="w-4 h-4 text-slate-400 focus:ring-brand-primary"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300">{{ $t('cities.inactive') }}</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <router-link
            to="/admin/cities"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {{ $t('common.cancel') }}
          </router-link>
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {{ $t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
