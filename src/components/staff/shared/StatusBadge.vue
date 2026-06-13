<script setup>
const props = defineProps({
  status: { type: String, required: true }
});

const styles = {
  booked: 'bg-blue-100/30 text-blue-700',
  completed: 'bg-green-100/30 text-green-700',
  cancelled: 'bg-red-100/30 text-red-700',
  rescheduled: 'bg-amber-100/30 text-amber-700',
  pending: 'bg-amber-100/30 text-amber-700',
  approved: 'bg-green-100/30 text-green-700',
  rejected: 'bg-red-100/30 text-red-700',
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-green-100/30 text-green-700',
  pending_review: 'bg-blue-100/30 text-blue-700',
  archived: 'bg-slate-100 text-slate-500',
  low: 'bg-red-100/30 text-red-700',
  medium: 'bg-amber-100/30 text-amber-700',
  good: 'bg-green-100/30 text-green-700'
};

function label(value) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>

<template>
    <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold" :class="styles[props.status] || 'bg-slate-100 text-slate-600'">
    {{ label(props.status) }}
  </span>
</template>
