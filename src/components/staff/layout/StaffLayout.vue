<script setup>
import { ref } from 'vue';
import StaffSidebar from './StaffSidebar.vue';
import AppNavbar from '../../global/AppNavbar.vue';
import StaffToastContainer from '../shared/StaffToastContainer.vue';

const mobileOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <StaffSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <div class="min-h-screen lg:pl-[260px]">
      <AppNavbar variant="dashboard" @toggleMobile="mobileOpen = !mobileOpen" />
      <main class="mx-auto w-full max-w-7xl p-5 lg:p-8">
        <slot />
      </main>
    </div>
    <StaffToastContainer />
  </div>
</template>
