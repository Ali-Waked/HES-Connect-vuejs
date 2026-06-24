<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'
import Sidebar from '../../components/dashboard/global/Sidebar.vue';
import AppNavbar from '../../components/global/AppNavbar.vue';
import ToastContainer from '../../components/dashboard/global/ToastContainer.vue';
import WorkspaceSwitcher from '../../components/global/WorkspaceSwitcher.vue';
import WorkspaceSelectorModal from '../../components/global/WorkspaceSelectorModal.vue';
import { RouterView } from 'vue-router';

const mobileSidebarOpen = ref(false);
const { locale } = useI18n()
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- Workspace Selector Modal -->
    <WorkspaceSelectorModal />

    <!-- Left Sidebar -->
    <Sidebar
      :mobile-open="mobileSidebarOpen"
      @close-mobile="mobileSidebarOpen = false"
    />

    <!-- Main Content Wrapper -->
    <div class="flex-grow flex flex-col min-w-0 transition-all duration-300" :class="locale === 'ar' ? 'lg:pr-[260px]' : 'lg:pl-[260px]'">
      <!-- Top Header -->
      <AppNavbar variant="dashboard" @toggleMobile="mobileSidebarOpen = !mobileSidebarOpen">
        <template #workspace-switcher>
          <WorkspaceSwitcher />
        </template>
      </AppNavbar>

      <!-- Page Body Content via router -->
      <main class="flex-grow p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <RouterView />
      </main>
    </div>

    <!-- Central Toast notifications -->
    <ToastContainer />
  </div>
</template>
