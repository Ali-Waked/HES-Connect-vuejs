import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref(localStorage.getItem('lang') || 'en')

  function setLanguage(lang) {
    currentLanguage.value = lang
    localStorage.setItem('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }

  return { currentLanguage, setLanguage }
})
