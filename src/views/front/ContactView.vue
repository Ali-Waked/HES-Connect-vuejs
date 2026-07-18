<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import { useContactForm } from '@/composables/useContactForm'

const { t } = useI18n()
const route = useRoute()
const {
  form, errors, apiError, submitting, success,
  clearFieldError, submit, NAME_MAX, EMAIL_MAX, MESSAGE_MAX,
} = useContactForm()

const openFaq = ref(null)

const contactMethods = [
  { key: 'email', icon: 'mail', label: t('contactPage.emailLabel'), value: 'info@hesconnect.ps', action: 'mailto:info@hesconnect.ps' },
  { key: 'phone', icon: 'call', label: t('contactPage.phoneLabel'), value: '+970 59 000 0000', action: 'tel:+970590000000' },
  { key: 'address', icon: 'location_on', label: t('contactPage.addressLabel'), value: t('contactPage.addressValue'), action: null },
  { key: 'hours', icon: 'schedule', label: t('contactPage.hoursLabel'), value: t('contactPage.hoursValue'), action: null },
]

const faqs = [
  { q: t('contactPage.faq1.q'), a: t('contactPage.faq1.a') },
  { q: t('contactPage.faq2.q'), a: t('contactPage.faq2.a') },
  { q: t('contactPage.faq3.q'), a: t('contactPage.faq3.a') },
  { q: t('contactPage.faq4.q'), a: t('contactPage.faq4.a') },
  { q: t('contactPage.faq5.q'), a: t('contactPage.faq5.a') },
]

onMounted(() => {
  if (route.query.subject) form.message = route.query.subject + '\n\n'
})

function toggleFaq(index) { openFaq.value = openFaq.value === index ? null : index }
function windowOpen(url) { window.open(url, '_blank') }
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-28 lg:pt-32">
      <!-- Hero -->
      <div class="text-center mb-12">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full mb-4 border border-brand-primary/20">
          <span class="material-symbols-outlined text-sm">mail</span>
          {{ t('contactPage.title') }}
        </span>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {{ t('contactPage.title') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('contactPage.description') }}
        </p>
      </div>

      <!-- Contact Info Cards -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div
          v-for="method in contactMethods"
          :key="method.key"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition"
          :class="method.action ? 'cursor-pointer' : ''"
          @click="method.action ? windowOpen(method.action) : null"
        >
          <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-3">
            <span class="material-symbols-outlined text-lg">{{ method.icon }}</span>
          </div>
          <p class="text-sm font-bold text-slate-900 dark:text-white">{{ method.label }}</p>
          <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ method.value }}</p>
        </div>
      </div>

      <!-- Form + FAQ -->
      <div class="grid lg:grid-cols-[1.2fr_1fr] gap-8">
        <!-- Form -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('contactPage.formTitle') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ t('contactPage.formDescription') }}</p>

          <div v-if="success" class="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
            <span class="material-symbols-outlined mt-0.5 text-emerald-600 dark:text-emerald-400">check_circle</span>
            <div>
              <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ t('contactPage.successTitle') }}</p>
              <p class="mt-0.5 text-sm text-emerald-600 dark:text-emerald-400">{{ t('contactPage.successMessage') }}</p>
            </div>
          </div>

          <div v-if="apiError" class="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <span class="material-symbols-outlined mt-0.5 text-red-500">error</span>
            <p class="text-sm font-semibold text-red-600 dark:text-red-400">{{ apiError }}</p>
          </div>

          <form class="grid gap-5" @submit.prevent="submit" novalidate>
            <label class="space-y-1.5">
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('contactPage.formName') }}</span>
              <input v-model="form.name" :maxlength="NAME_MAX" :placeholder="t('contactPage.formNamePlaceholder')" class="input-base" :class="errors.name ? 'border-red-500' : ''" @input="clearFieldError('name')" />
              <p v-if="errors.name" class="text-xs font-semibold text-red-500">{{ errors.name }}</p>
            </label>
            <label class="space-y-1.5">
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('contactPage.formEmail') }}</span>
              <input v-model="form.email" type="email" :maxlength="EMAIL_MAX" :placeholder="t('contactPage.formEmailPlaceholder')" class="input-base" :class="errors.email ? 'border-red-500' : ''" @input="clearFieldError('email')" />
              <p v-if="errors.email" class="text-xs font-semibold text-red-500">{{ errors.email }}</p>
            </label>
            <label class="space-y-1.5">
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('contactPage.formMessage') }}</span>
              <textarea v-model="form.message" rows="5" :maxlength="MESSAGE_MAX" :placeholder="t('contactPage.formMessagePlaceholder')" class="input-base resize-none" :class="errors.message ? 'border-red-500' : ''" @input="clearFieldError('message')"></textarea>
              <div class="flex items-center justify-between">
                <p v-if="errors.message" class="text-xs font-semibold text-red-500">{{ errors.message }}</p>
                <p v-else class="text-xs text-slate-400 dark:text-slate-500">{{ form.message.length }}/{{ MESSAGE_MAX }}</p>
              </div>
            </label>
            <button type="submit" :disabled="submitting" class="w-full py-3 px-5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              <span>{{ submitting ? t('contactPage.sending') : t('contactPage.sendButton') }}</span>
            </button>
          </form>
        </div>

        <!-- FAQ -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ t('contactPage.faqTitle') }}</h2>
          <div v-for="(faq, idx) in faqs" :key="idx" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200" :class="openFaq === idx ? 'shadow-md' : ''">
            <button type="button" class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer" :class="openFaq === idx ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''" @click="toggleFaq(idx)">
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ faq.q }}</span>
              <span class="material-symbols-outlined text-lg text-slate-400 shrink-0 transition-transform duration-200" :class="openFaq === idx ? 'rotate-180' : ''">expand_more</span>
            </button>
            <div v-show="openFaq === idx" class="border-t border-slate-100 dark:border-slate-700 px-5 pb-4 pt-3">
              <p class="text-sm leading-7 text-slate-600 dark:text-slate-400">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
