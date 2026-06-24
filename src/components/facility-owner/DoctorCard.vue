<script setup>
defineProps({
  doctor: { type: Object, required: true }
})

function initial(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

function avatarColor(name) {
  if (!name) return 'bg-brand-primary'
  const colors = [
    'bg-brand-primary', 'bg-blue-600', 'bg-purple-600',
    'bg-amber-600', 'bg-green-600', 'bg-rose-600'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="card-base p-4 space-y-4">
    <div class="flex items-center gap-3">
      <img v-if="doctor.avatar" :src="doctor.avatar" alt="" class="w-10 h-10 rounded-full object-cover" />
      <div v-else class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" :class="avatarColor(doctor.name)">
        {{ initial(doctor.name) }}
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ doctor.name }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ doctor.specialization }}</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 text-center">
      <div>
        <p class="text-lg font-bold text-slate-900 dark:text-white">{{ doctor.appointments }}</p>
        <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Appts</p>
      </div>
      <div>
        <p class="text-lg font-bold text-emerald-600">{{ doctor.completedRate }}%</p>
        <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
      </div>
      <div>
        <p class="text-lg font-bold text-red-500">{{ doctor.cancelledRate }}%</p>
        <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cancelled</p>
      </div>
    </div>

    <div class="space-y-2">
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="font-semibold text-slate-500">Completed</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ doctor.completedRate }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: doctor.completedRate + '%' }"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="font-semibold text-slate-500">Cancelled</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ doctor.cancelledRate }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full bg-red-400 transition-all" :style="{ width: doctor.cancelledRate + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
