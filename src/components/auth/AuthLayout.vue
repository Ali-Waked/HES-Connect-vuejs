<script setup>
import { useI18n } from 'vue-i18n'
import HesLogo from '@/components/global/HesLogo.vue'

const { t } = useI18n()

defineProps({
  variant: { type: String, default: 'centered' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showBrand: { type: Boolean, default: true },
})
</script>

<template>
  <!-- Split layout for Login/Register -->
  <div v-if="variant === 'split'" class="min-h-screen flex flex-col bg-landing-cream font-sans antialiased">
    <div class="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <div class="w-full max-w-sm sm:max-w-md">
        <div class="text-center mb-5 sm:mb-6">
          <router-link to="/" aria-label="HES Connect Home" class="inline-flex justify-center mb-3 sm:mb-4">
            <HesLogo variant="full" :height="40" theme="light" />
          </router-link>
          <p class="text-xs sm:text-sm text-landing-muted leading-relaxed max-w-xs mx-auto px-2 sm:px-0">
            {{ t('auth.description') }}
          </p>
        </div>
        <slot />
      </div>
    </div>
    <div class="text-center sm:text-right px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 text-xs text-landing-muted">
      &copy; {{ new Date().getFullYear() }} HES Connect. All rights reserved.
    </div>
  </div>

  <!-- Centered layout for other auth pages -->
  <div v-else class="min-h-screen flex flex-col items-center justify-center bg-landing-cream px-4 py-12 font-sans antialiased">
    <div class="w-full max-w-md">
      <div v-if="showBrand" class="text-center mb-8">
        <router-link to="/" aria-label="HES Connect Home" class="inline-flex justify-center">
          <HesLogo variant="full" :height="40" theme="light" />
        </router-link>
      </div>
      <slot />
    </div>
    <div class="mt-8 text-center text-xs text-landing-muted">
      <p>&copy; {{ new Date().getFullYear() }} HES Connect. All rights reserved.</p>
    </div>
  </div>
</template>
