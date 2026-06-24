<template>
  <div class="animate-fade-in">
    <p class="text-sm text-slate-500">Redirecting to unified dashboard...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
onMounted(() => {
  router.replace('/facility/dashboard')
})
</script>
