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
import { permission, permissionAny, permissionAll } from './directives/permission'

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
app.directive('permission', permission)
app.directive('permission-any', permissionAny)
app.directive('permission-all', permissionAll)
app.mount('#app')

AOS.init({
  duration: 800,
  once: true,
})


