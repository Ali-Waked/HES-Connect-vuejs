<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDonationFlowStore } from '@/stores/useDonationFlowStore'
import { resolveTranslatedValue } from '@/utils/locale'

const props = defineProps({ show: Boolean, story: Object })
const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const store = useDonationFlowStore()

const quickAmounts = [10, 25, 50, 100]
const selectedQuick = ref(25)
const customAmount = ref('')
const message = ref('')
const error = ref('')

const finalAmount = computed(() => {
  if (selectedQuick.value !== null) return selectedQuick.value
  const parsed = parseFloat(customAmount.value)
  return isNaN(parsed) ? 0 : parsed
})

function pickQuick(amount) {
  selectedQuick.value = amount
  customAmount.value = ''
  error.value = ''
}

function onCustomInput() {
  selectedQuick.value = null
  error.value = ''
}

async function submit() {
  if (finalAmount.value <= 0) {
    error.value = t('donations.invalidAmount')
    return
  }

  error.value = ''
  const storyId = props.story?.uuid || props.story?.id

  try {
    await store.initiateCheckout(storyId, {
      amount: finalAmount.value,
      message: message.value || undefined,
    })
  } catch (err) {
    error.value = err.response?.data?.message || t('donations.failed')
  }
}

watch(() => props.show, (v) => {
  if (v) {
    selectedQuick.value = 25
    customAmount.value = ''
    message.value = ''
    error.value = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" @click.self="$emit('close')">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white">
                  {{ t('donations.supportStory') || 'Support Story' }}
                </h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ story?.title ? resolveTranslatedValue(story.title, locale.value) : '' }}
                </p>
              </div>
            </div>
            <button class="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer" @click="$emit('close')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-5 p-6">
            <!-- Quick Amounts -->
            <div>
              <label class="mb-2 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ t('donations.chooseAmount') || 'Choose Amount' }}
              </label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="amount in quickAmounts"
                  :key="amount"
                  class="rounded-xl border-2 px-3 py-3 text-center text-sm font-bold transition cursor-pointer"
                  :class="selectedQuick === amount
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
                  @click="pickQuick(amount)"
                >
                  ${{ amount }}
                </button>
              </div>
            </div>

            <!-- Custom Amount -->
            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ t('donations.customAmount') || 'Custom Amount' }}
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  min="1"
                  v-model.number="customAmount"
                  :placeholder="t('donations.enterAmount') || 'Enter amount'"
                  class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-7 pr-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                  @input="onCustomInput"
                />
              </div>
            </div>

            <!-- Message -->
            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ t('donations.message') || 'Message' }} <span class="font-normal normal-case">(optional)</span>
              </label>
              <textarea
                v-model="message"
                rows="2"
                :placeholder="t('donations.messagePlaceholder') || 'Leave a kind message...'"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none"
              />
            </div>

            <!-- Error -->
            <p v-if="error" class="text-sm text-red-500 font-medium">{{ error }}</p>

            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button
                class="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                @click="$emit('close')"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                :disabled="store.checkoutLoading || finalAmount <= 0"
                class="flex-1 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                @click="submit"
              >
                <svg v-if="store.checkoutLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ store.checkoutLoading ? (t('donations.processing') || 'Processing...') : `${t('donations.donate') || 'Donate'} $${finalAmount || 0}` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
