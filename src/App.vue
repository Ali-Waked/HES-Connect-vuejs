<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import PublicToastContainer from '@/components/global/PublicToastContainer.vue';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const languageStore = useLanguageStore();

onMounted(async () => {
  await authStore.init();

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      themeStore.setDark(e.matches);
    }
  });

  const lang = languageStore.currentLanguage;
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
});
</script>

<template>
  <RouterView />
  <PublicToastContainer />
</template>
