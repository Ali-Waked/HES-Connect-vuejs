<script setup>
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

const { locale } = useI18n()
const languageStore = useLanguageStore()

function switchLang(lang) {
  locale.value = lang
  languageStore.setLanguage(lang)
}

// Apply on initial load if not already set
const saved = languageStore.currentLanguage
document.documentElement.setAttribute('dir', saved === 'ar' ? 'rtl' : 'ltr')
document.documentElement.setAttribute('lang', saved)
</script>

<template>
  <div class="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg transition-colors">
    <button
      @click="switchLang('en')"
      class="px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer"
      :class="locale === 'en'
        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
    >
      EN
    </button>
    <button
      @click="switchLang('ar')"
      class="px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer"
      :class="locale === 'ar'
        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
    >
      ع
    </button>
  </div>
</template>
