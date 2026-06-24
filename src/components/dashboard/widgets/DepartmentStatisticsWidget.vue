<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Department Summary</h3>
        <p class="text-sm text-slate-500">Quick overview</p>
      </div>
      <button class="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" @click="$router.push('/facility/departments')">Manage</button>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="space-y-3">
        <div class="h-14 w-full animate-pulse rounded bg-slate-100"></div>
        <div class="h-14 w-full animate-pulse rounded bg-slate-100"></div>
      </div>

      <div v-else class="space-y-3">
        <div v-for="dept in store.departments" :key="dept.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
          <div>
            <p class="font-semibold text-slate-900">{{ resolveTranslatedValue(dept.name) }}</p>
            <p class="text-xs text-slate-500">{{ dept.headDoctor }}</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ dept.staffCount }} staff</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})
</script>
