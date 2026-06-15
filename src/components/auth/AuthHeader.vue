<script setup>
import HesLogo from '@/components/global/HesLogo.vue'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showLogo: { type: Boolean, default: true },
  centered: { type: Boolean, default: false },
})
</script>

<template>
  <header
    class="mb-8"
    :class="{ 'text-center': centered }"
  >
    <div v-if="showLogo" :class="centered ? 'flex justify-center mb-6' : 'mb-6'">
      <router-link to="/" aria-label="HES Connect Home">
        <HesLogo variant="full" :height="40" theme="light" />
      </router-link>
    </div>
    <div v-if="title">
      <h1
        class="text-2xl font-bold tracking-tight text-landing-dark"
        :class="{ 'text-center': centered }"
      >
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="mt-2 text-sm leading-relaxed text-landing-muted"
        :class="{ 'text-center': centered }"
      >
        {{ subtitle }}
      </p>
    </div>
    <slot />
  </header>
</template>
