<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FacilityOwnerSidebar from '@/components/facility-owner/FacilityOwnerSidebar.vue'
import FacilityOwnerTopbar from '@/components/facility-owner/FacilityOwnerTopbar.vue'
import FacilityToastContainer from '@/components/facility-owner/FacilityToastContainer.vue'

const { locale } = useI18n()
const mobileOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950">
    <FacilityOwnerSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <div class="min-h-screen" :class="locale === 'ar' ? 'lg:pr-[260px]' : 'lg:pl-[260px]'">
      <FacilityOwnerTopbar @toggleMobile="mobileOpen = !mobileOpen" />
      <main class="mx-auto w-full max-w-7xl p-5 lg:p-8">
        <slot />
      </main>
    </div>
    <FacilityToastContainer />
  </div>
</template>
