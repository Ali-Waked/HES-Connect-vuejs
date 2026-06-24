<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  breadcrumbs: { type: Array, default: () => [] },
  size: { type: String, default: 'default' },
  gradient: { type: String, default: 'from-slate-900 via-slate-800 to-slate-900' },
})

const router = useRouter()
const { t } = useI18n()

const paddingClass = computed(() =>
  props.size === 'compact' ? 'pt-28 lg:pt-32 pb-10 lg:pb-14' : 'pt-28 lg:pt-32 pb-14 lg:pb-20'
)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <section class="relative overflow-hidden bg-slate-900 bg-gradient-to-br" :class="gradient">
    <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
    <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" :class="paddingClass">
      <button
        v-if="breadcrumbs.length === 0"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white mb-4 transition cursor-pointer group"
        @click="goBack"
      >
        <svg class="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        {{ t('common.back') }}
      </button>

      <nav v-else class="flex items-center gap-2 text-sm text-white/60 mb-5" aria-label="Breadcrumb">
        <button
          class="hover:text-white transition cursor-pointer flex items-center gap-1"
          @click="router.push('/')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
          </svg>
          <span class="hidden sm:inline">{{ t('nav.home') }}</span>
        </button>
        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
          <svg class="w-3.5 h-3.5 rtl:rotate-180 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
          <button
            v-if="crumb.to && idx < breadcrumbs.length - 1"
            class="hover:text-white transition cursor-pointer"
            @click="router.push(crumb.to)"
          >{{ crumb.label }}</button>
          <span v-else class="text-white/80 font-medium">{{ crumb.label }}</span>
        </template>
      </nav>

      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-4 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
        {{ description }}
      </p>
    </div>

    <!-- <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div> -->
  </section>
</template>
