<script setup>
import { ref, computed, watch } from 'vue';
import { useStoriesStore } from '@/stores/useStoriesStore';

const props = defineProps({ show: Boolean, story: Object });
const emit = defineEmits(['close']);

const store = useStoriesStore();
const quickAmounts = [10, 25, 50, 100];
const selectedQuick = ref(null);
const customAmount = ref('');
const paymentMethod = ref('credit');
const donorName = ref('');
const error = ref('');

const finalAmount = computed(() => {
  if (selectedQuick.value !== null) return selectedQuick.value;
  const parsed = parseInt(customAmount.value);
  return isNaN(parsed) ? 0 : parsed;
});

function pickQuick(amount) {
  selectedQuick.value = amount;
  customAmount.value = '';
  error.value = '';
}

function onCustomInput() {
  selectedQuick.value = null;
  error.value = '';
}

function submit() {
  if (finalAmount.value <= 0) { error.value = 'Please enter a valid donation amount.'; return; }
  store.donate(props.story.id, finalAmount.value, donorName.value || 'Anonymous');
  store.showToast(`Thank you! Your donation of $${finalAmount.value.toLocaleString()} has been recorded 💚`, 'success');
  emit('close');
}

watch(() => props.show, (v) => {
  if (v) { selectedQuick.value = 25; customAmount.value = ''; donorName.value = ''; paymentMethod.value = 'credit'; error.value = ''; }
});
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 dark:bg-slate-900/60 p-4 backdrop-blur-xs" @click.self="$emit('close')">
    <div class="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-primary">favorite</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Support {{ story?.patientFirstName }}'s Story</h2>
        </div>
        <button class="rounded-lg p-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300" @click="$emit('close')">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      <div class="space-y-5 p-5">
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Choose an amount</label>
          <div class="flex gap-2">
            <button v-for="amount in quickAmounts" :key="amount"
              class="flex-1 rounded-lg border-2 px-3 py-3 text-center text-sm font-bold transition"
              :class="selectedQuick === amount ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'"
              @click="pickQuick(amount)">${{ amount }}</button>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Or enter custom amount</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">$</span>
            <input type="number" min="1" v-model.number="customAmount" placeholder="Enter amount"
              class="w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2.5 pl-7 pr-3 text-sm" @input="onCustomInput" />
          </div>
        </div>
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Method</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="paymentMethod" value="credit" /> Credit Card</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="paymentMethod" value="paypal" /> PayPal</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="paymentMethod" value="cash" /> Cash</label>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Your Name <span class="text-slate-400 dark:text-slate-500 font-normal">(optional)</span></label>
          <input v-model="donorName" placeholder="Anonymous" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
        </div>
        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
        <div class="flex gap-3 pt-1">
          <button class="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700" @click="$emit('close')">Cancel</button>
          <button class="flex-1 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-hover" @click="submit">Donate ${{ finalAmount || 0 }} →</button>
        </div>
      </div>
    </div>
  </div>
</template>
