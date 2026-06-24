<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import PageHero from '../../components/shared/PageHero.vue'
import { useContactForm } from '../../composables/useContactForm'

const { t } = useI18n()
const route = useRoute()
const {
  form,
  errors,
  apiError,
  submitting,
  success,
  clearFieldError,
  submit,
  NAME_MAX,
  EMAIL_MAX,
  MESSAGE_MAX,
} = useContactForm()

const openFaq = ref(null)

const contactMethods = [
  { key: 'email', icon: 'mail', label: t('contactPage.emailLabel'), value: 'info@hesconnect.ps', action: 'mailto:info@hesconnect.ps' },
  { key: 'phone', icon: 'call', label: t('contactPage.phoneLabel'), value: '+970 59 000 0000', action: 'tel:+970590000000' },
  { key: 'address', icon: 'location_on', label: t('contactPage.addressLabel'), value: t('contactPage.addressValue'), action: null },
  { key: 'hours', icon: 'schedule', label: t('contactPage.hoursLabel'), value: t('contactPage.hoursValue'), action: null },
]

onMounted(() => {
  if (route.query.subject) {
    form.message = route.query.subject + '\n\n'
  }
})

const faqs = [
  { q: t('contactPage.faq1.q'), a: t('contactPage.faq1.a') },
  { q: t('contactPage.faq2.q'), a: t('contactPage.faq2.a') },
  { q: t('contactPage.faq3.q'), a: t('contactPage.faq3.a') },
  { q: t('contactPage.faq4.q'), a: t('contactPage.faq4.a') },
  { q: t('contactPage.faq5.q'), a: t('contactPage.faq5.a') },
]

const socialLinks = [
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Twitter', icon: 'x' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'LinkedIn', icon: 'linkedin' },
]

function toggleFaq(index) {
  openFaq.value = openFaq.value === index ? null : index
}

function windowOpen(url) {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <PageHero
      :title="t('contactPage.title')"
      :description="t('contactPage.description')"
      :breadcrumbs="[
        { label: t('contactPage.title') }
      ]"
    />

    <main>
      <!-- Contact Info + Form -->
      <section class="section-padding">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <!-- Contact Info Cards 2x2 -->
            <div class="grid sm:grid-cols-2 gap-4 content-start">
              <article
                v-for="method in contactMethods"
                :key="method.key"
                class="card-hover p-5"
                :class="method.action ? 'cursor-pointer' : ''"
                @click="method.action ? windowOpen(method.action) : null"
              >
                <div class="icon-box mb-3">
                  <span class="material-symbols-outlined text-xl">{{ method.icon }}</span>
                </div>
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ method.label }}</p>
                <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ method.value }}</p>
              </article>
            </div>

            <!-- Form -->
            <div class="card-base p-6 sm:p-8">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ t('contactPage.formTitle') }}</h2>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('contactPage.formDescription') }}</p>

              <div
                v-if="success"
                class="mt-6 flex items-start gap-3 rounded-xl border border-success-light bg-success-light dark:bg-success/10 dark:border-success/30 p-4"
              >
                <span class="material-symbols-outlined mt-0.5 text-success dark:text-success">check_circle</span>
                <div>
                  <p class="text-sm font-bold text-success dark:text-success">{{ t('contactPage.successTitle') }}</p>
                  <p class="mt-0.5 text-sm text-success dark:text-success/80">{{ t('contactPage.successMessage') }}</p>
                </div>
              </div>

              <div
                v-if="apiError"
                class="mt-6 flex items-start gap-3 rounded-xl border border-danger-light bg-danger-light dark:bg-danger/10 dark:border-danger/30 p-4"
              >
                <span class="material-symbols-outlined mt-0.5 text-danger dark:text-danger">error</span>
                <p class="text-sm font-semibold text-danger dark:text-danger">{{ apiError }}</p>
              </div>

              <form class="mt-6 grid gap-5" @submit.prevent="submit" novalidate>
                <label class="space-y-1.5">
                  <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('contactPage.formName') }}</span>
                  <input
                    v-model="form.name"
                    :maxlength="NAME_MAX"
                    :placeholder="t('contactPage.formNamePlaceholder')"
                    class="input-base"
                    :class="errors.name ? 'border-danger' : ''"
                    @input="clearFieldError('name')"
                  />
                  <p v-if="errors.name" class="text-xs font-semibold text-danger">{{ errors.name }}</p>
                </label>

                <label class="space-y-1.5">
                  <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('contactPage.formEmail') }}</span>
                  <input
                    v-model="form.email"
                    type="email"
                    :maxlength="EMAIL_MAX"
                    :placeholder="t('contactPage.formEmailPlaceholder')"
                    class="input-base"
                    :class="errors.email ? 'border-danger' : ''"
                    @input="clearFieldError('email')"
                  />
                  <p v-if="errors.email" class="text-xs font-semibold text-danger">{{ errors.email }}</p>
                </label>

                <label class="space-y-1.5">
                  <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('contactPage.formMessage') }}</span>
                  <textarea
                    v-model="form.message"
                    rows="5"
                    :maxlength="MESSAGE_MAX"
                    :placeholder="t('contactPage.formMessagePlaceholder')"
                    class="input-base resize-none"
                    :class="errors.message ? 'border-danger' : ''"
                    @input="clearFieldError('message')"
                  ></textarea>
                  <div class="flex items-center justify-between">
                    <p v-if="errors.message" class="text-xs font-semibold text-danger">{{ errors.message }}</p>
                    <p v-else class="text-xs text-slate-400 dark:text-slate-500">{{ form.message.length }}/{{ MESSAGE_MAX }}</p>
                  </div>
                </label>

                <button
                  type="submit"
                  :disabled="submitting"
                  class="btn-primary w-full"
                >
                  <svg
                    v-if="submitting"
                    class="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span v-if="submitting">{{ t('contactPage.sending') }}</span>
                  <span v-else>{{ t('contactPage.sendButton') }}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="bg-white dark:bg-slate-800/50 section-padding">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-10 lg:mb-12">
            <span class="eyebrow-badge mb-4">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
              {{ t('contactPage.faqEyebrow') }}
            </span>
            <h2 class="section-heading-center">
              {{ t('contactPage.faqTitle') }}
            </h2>
            <p class="mt-3 text-base text-slate-500 dark:text-slate-400">
              {{ t('contactPage.faqDescription') }}
            </p>
          </div>

          <div class="space-y-3">
            <article
              v-for="(faq, idx) in faqs"
              :key="idx"
              class="card-base overflow-hidden transition-all duration-300"
              :class="openFaq === idx ? 'shadow-card-hover' : ''"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition cursor-pointer"
                :class="openFaq === idx ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''"
                @click="toggleFaq(idx)"
              >
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ faq.q }}</span>
                <svg
                  class="w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200"
                  :class="openFaq === idx ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                >
                  <path stroke-linecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                </svg>
              </button>
              <div
                v-show="openFaq === idx"
                class="border-t border-slate-200 dark:border-slate-700 px-6 pb-4 pt-3"
              >
                <p class="text-sm leading-7 text-slate-600 dark:text-slate-400">{{ faq.a }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Map + Social -->
      <section class="section-padding">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid gap-8 lg:grid-cols-2">
            <!-- Map -->
            <div class="card-base p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="icon-box">
                  <span class="material-symbols-outlined text-xl">map</span>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('contactPage.mapTitle') }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('contactPage.mapDescription') }}</p>
                </div>
              </div>
              <div class="flex h-56 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 sm:h-64">
                <div class="text-center">
                  <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">map</span>
                  <p class="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">{{ t('contactPage.mapPlaceholder') }}</p>
                </div>
              </div>
            </div>

            <!-- Social -->
            <div class="card-base p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="icon-box">
                  <span class="material-symbols-outlined text-xl">public</span>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('contactPage.socialTitle') }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('contactPage.socialDescription') }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-3">
                <div
                  v-for="link in socialLinks"
                  :key="link.name"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand-primary/30 hover:text-brand-primary cursor-pointer"
                >
                  <span class="material-symbols-outlined text-lg">public</span>
                  {{ link.name }}
                </div>
              </div>
              <p class="mt-4 text-xs text-slate-400 dark:text-slate-500">{{ t('contactPage.socialNote') }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
