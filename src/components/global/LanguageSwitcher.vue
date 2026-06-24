<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

defineProps({
  overlay: { type: Boolean, default: false }
})

const { locale } = useI18n()
const languageStore = useLanguageStore()
const open = ref(false)
const dropdownRef = ref(null)

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
]

const currentLang = computed(() => languages.find(l => l.code === locale.value) || languages[0])

function switchLang(lang) {
  locale.value = lang
  languageStore.setLanguage(lang)
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', lang)
  open.value = false
}

function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
      :class="overlay
        ? 'text-white/80 hover:text-white hover:bg-white/10'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'"
      @click="open = !open"
    >
      <span class="text-base leading-none">{{ currentLang.flag }}</span>
      <span class="text-xs font-semibold tracking-wide uppercase">{{ currentLang.code }}</span>
      <svg
        class="w-3 h-3 transition-transform duration-200"
        :class="[open ? 'rotate-180' : '', overlay ? 'text-white/60' : 'text-slate-400 dark:text-slate-500']"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
      </svg>
    </button>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="open"
        class="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/20 border border-slate-200 dark:border-slate-700 py-1 overflow-hidden z-50"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition cursor-pointer"
          :class="lang.code === locale
            ? 'bg-brand-primary/5 text-brand-primary'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
          @click="switchLang(lang.code)"
        >
          <span class="text-base">{{ lang.flag }}</span>
          <span>{{ lang.label }}</span>
          <svg
            v-if="lang.code === locale"
            class="w-4 h-4 ml-auto text-brand-primary"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>
