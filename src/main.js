import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useThemeStore } from '../src/stores/useThemeStore.js'
import { createI18n } from 'vue-i18n'
import router from './router'
import './style.css'
import 'aos/dist/aos.css'
import AOS from 'aos'
import App from './App.vue'
import en from './locales/en.js'
import ar from './locales/ar.js'

const savedLang = localStorage.getItem('lang') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { en, ar }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
useThemeStore();
app.use(i18n)
app.use(router)
app.mount('#app')

AOS.init({
  duration: 800,
  once: true,
})


