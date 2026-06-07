<script setup>
import RatingStars from './RatingStars.vue';

defineProps({
  review: {
    type: Object,
    required: true,
    // { patient_name, rating, comment, date, appointment_id }
  },
  showAppointment: {
    type: Boolean,
    default: false
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
          {{ review.patient_name?.charAt(0) || 'P' }}
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900">{{ review.patient_name }}</h4>
          <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{{ formatDate(review.date || review.created_at) }}</p>
        </div>
      </div>
      <RatingStars :rating="review.rating" size="xs" />
    </div>
    
    <p class="text-sm text-slate-600 leading-relaxed italic">
      "{{ review.comment || review.content }}"
    </p>

    <div v-if="showAppointment && review.appointment_id" class="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment ID</span>
      <span class="text-xs font-mono text-brand-primary font-semibold bg-brand-primary/5 px-2 py-0.5 rounded">{{ review.appointment_id }}</span>
    </div>
  </div>
</template>
