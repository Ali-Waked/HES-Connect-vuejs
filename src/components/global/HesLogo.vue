<script setup>
const props = defineProps({
  variant: { type: String, default: 'full' },
  theme:   { type: String, default: 'light' },
  height:  { type: Number, default: 36 },
})

const isDark = props.theme === 'dark' || props.theme === 'white'
const tileColor = props.theme === 'dark' ? '#1e293b' : '#0f172a'
const tileBorder = props.theme === 'dark' ? '#334155' : 'none'
const hesTextColor = isDark ? '#FFFFFF' : '#1a2e2d'
const connectTextColor = '#027a75'
const scale = props.height / 48
</script>

<template>
  <svg
    v-if="variant === 'icon'"
    :width="height"
    :height="height"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="HES Connect"
  >
    <title>HES Connect</title>
    <rect width="48" height="48" rx="12" :fill="tileColor"/>
    <rect v-if="tileBorder !== 'none'" x="1" y="1" width="46" height="46" rx="11" fill="none" :stroke="tileBorder" stroke-width="1"/>
    <path d="M15 12 L15 36" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <path d="M27 12 L27 36" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <path d="M15 24 L27 24" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <path d="M27 12 L36 12 L36 36 L27 36" stroke="#027a75" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="27" cy="24" r="3.5" fill="#d97706"/>
    <circle cx="27" cy="24" r="7.5" fill="none" stroke="#d97706" stroke-width="1.5" opacity="0.3"/>
  </svg>

  <span
    v-else
    class="hes-logo-full"
    role="img"
    aria-label="HES Connect"
    :style="{ display: 'inline-flex', alignItems: 'center', gap: `${scale * 10}px` }"
  >
    <svg
      :width="height"
      :height="height"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style="flex-shrink: 0;"
    >
      <rect width="48" height="48" rx="12" :fill="tileColor"/>
      <rect v-if="tileBorder !== 'none'" x="1" y="1" width="46" height="46" rx="11" fill="none" :stroke="tileBorder" stroke-width="1"/>
      <path d="M15 12 L15 36" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <path d="M27 12 L27 36" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <path d="M15 24 L27 24" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <path d="M27 12 L36 12 L36 36 L27 36" stroke="#027a75" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="27" cy="24" r="3.5" fill="#d97706"/>
    <circle cx="27" cy="24" r="7.5" fill="none" stroke="#d97706" stroke-width="1.5" opacity="0.3"/>
  </svg>

  <span
      aria-hidden="true"
      :style="{
        fontFamily: `'Plus Jakarta Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif`,
        fontSize: `${Math.round(scale * 18)}px`,
        lineHeight: '1',
        letterSpacing: '-0.03em',
        whiteSpace: 'nowrap',
      }"
    >
      <span :style="{ fontWeight: 800, color: hesTextColor }">HES</span
      ><span :style="{ fontWeight: 400, color: connectTextColor }"> Connect</span>
    </span>
  </span>
</template>
