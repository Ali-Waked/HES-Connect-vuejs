<script setup>
import { ref } from 'vue';
import Sidebar from '../../components/dashboard/global/Sidebar.vue';
import Header from '../../components/dashboard/global/Header.vue';
import ToastContainer from '../../components/dashboard/global/ToastContainer.vue';
import { RouterView } from 'vue-router';

const mobileSidebarOpen = ref(false);
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
    <!-- Left Sidebar -->
    <Sidebar
      :mobile-open="mobileSidebarOpen"
      @close-mobile="mobileSidebarOpen = false"
    />

    <!-- Main Content Wrapper -->
    <div class="flex-grow flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300">
      <!-- Top Header -->
      <Header @toggle-mobile="mobileSidebarOpen = !mobileSidebarOpen" />

      <!-- Page Body Content via router -->
      <main class="flex-grow p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <RouterView />
      </main>
    </div>

    <!-- Central Toast notifications -->
    <ToastContainer />
  </div>
</template>
