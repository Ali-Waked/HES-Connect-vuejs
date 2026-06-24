<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import OrganizationSidebar from '../../components/organization/OrganizationSidebar.vue';
import AppNavbar from '../../components/global/AppNavbar.vue';

const { locale } = useI18n();
const mobileOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <OrganizationSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <div class="min-h-screen" :class="locale === 'ar' ? 'lg:pr-[260px]' : 'lg:pl-[260px]'">
      <AppNavbar variant="dashboard" @toggleMobile="mobileOpen = !mobileOpen" />
      <main class="mx-auto w-full max-w-7xl p-5 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
