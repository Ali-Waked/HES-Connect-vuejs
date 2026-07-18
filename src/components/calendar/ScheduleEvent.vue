<script setup>
const props = defineProps({
  schedule: { type: Object, required: true },
  color: { type: String, default: '#3B82F6' },
  position: { type: Object, required: true },
})

const emit = defineEmits(['click'])
</script>

<template>
  <div
    class="absolute left-0.5 right-0.5 rounded-md px-2 py-1 cursor-pointer transition-all duration-150 hover:brightness-95 hover:shadow-md overflow-hidden group border"
    :style="{
      top: position.top + 'px',
      height: position.height + 'px',
      backgroundColor: color + '18',
      borderColor: color + '40',
    }"
    @click.stop="emit('click', schedule)"
  >
    <div class="font-semibold text-[11px] leading-tight truncate" :style="{ color }">
      {{ schedule.facility?.name || 'Schedule' }}
    </div>
    <div class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
      {{ schedule.start_time }} - {{ schedule.end_time }}
    </div>
  </div>
</template>
