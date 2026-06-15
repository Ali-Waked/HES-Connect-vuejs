<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useDashboardStore } from '../../stores/dashboard';
import { useThemeStore } from '../../stores/useThemeStore';
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '../../utils/locale'

const { t } = useI18n()
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const themeStore = useThemeStore();

const name = ref(resolveTranslatedValue(authStore.user?.name) || '');
const saving = ref(false);

function handleSave() {
  if (!name.value.trim()) return;
  saving.value = true;
  authStore.updateProfile({ name: name.value.trim() });
  dashboardStore.addToast('Settings saved successfully', 'success');
  saving.value = false;
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-xl">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{{ t('pageTitles.settings') }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('pageTitles.settingsDesc') }}</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-5">
      <div class="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-700">
        <div class="w-14 h-14 bg-brand-primary text-white font-bold rounded-full flex items-center justify-center text-xl">
          {{ authStore.user?.initials }}
        </div>
        <div>
          <p class="text-base font-bold text-slate-900 dark:text-slate-100">{{ resolveTranslatedValue(authStore.user?.name) }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ authStore.user?.role }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Display name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none transition"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
          <input
            id="email"
            :value="authStore.user?.email"
            type="email"
            disabled
            class="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sign-in provider</label>
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize"
            :class="authStore.user?.provider === 'google' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'"
          >
            {{ authStore.user?.provider || 'email' }}
          </span>
        </div>
      </div>

      <button
        class="inline-flex items-center gap-2 py-2.5 px-5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-60"
        :disabled="saving || !name.trim()"
        @click="handleSave"
      >
        {{ t('common.save') }}
      </button>
    </div>

    <!-- Appearance Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-5">
      <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Appearance</h2>

      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Dark Mode</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Switch between light and dark theme</p>
        </div>
        <button
          class="relative w-14 h-7 rounded-full transition-colors duration-200 cursor-pointer"
          :class="themeStore.isDark ? 'bg-brand-primary' : 'bg-slate-300'"
          @click="themeStore.toggle()"
          role="switch"
          :aria-checked="themeStore.isDark"
        >
          <span
            class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200 flex items-center justify-center"
            :class="themeStore.isDark ? 'left-[calc(100%-1.75rem)]' : ''"
          >
            <svg v-if="themeStore.isDark" class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
