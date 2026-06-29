<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HesLogo from '@/components/global/HesLogo.vue'
import SubscribeForm from '@/components/subscriptions/SubscribeForm.vue'

const { t, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const sections = computed(() => [
  {
    title: t('footer.quickLinks'),
    links: [
      { label: t('nav.home'), to: '/' },
      { label: t('nav.facilities'), to: '/facilities' },
      { label: t('nav.doctors'), to: '/doctors' },
      { label: t('nav.stories'), to: '/stories' },
      { label: t('nav.about'), to: '/about' },
      { label: t('nav.jobs'), to: '/jobs' },
      { label: t('nav.contact'), to: '/contact' },
    ]
  },
  {
    title: t('footer.services'),
    links: [
      { label: t('footer.findHospitals'), to: '/facilities' },
      { label: t('footer.findDoctors'), to: '/doctors' },
      { label: t('footer.healthArticles'), to: '/articles' },
      { label: t('footer.contactSupport'), to: '/contact' },
    ]
  },
])

const socials = [
  {
    name: 'Facebook',
    icon: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>'
  },
  {
    name: 'Twitter / X',
    icon: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>'
  },
  {
    name: 'Instagram',
    icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>'
  },
  {
    name: 'LinkedIn',
    icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>'
  },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(2,122,117,0.08),transparent_50%)] pointer-events-none"></div>
    <div class="relative">
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-14 lg:py-20">
        <div class="grid sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 lg:gap-x-12">

          <div class="sm:col-span-2 lg:col-span-3 space-y-5">
            <HesLogo variant="full" :height="32" theme="dark" />
            <p class="text-sm text-slate-400 leading-relaxed max-w-xs">
              {{ $t('footer.description') }}
            </p>
            <div class="flex gap-2.5 pt-1">
              <a
                v-for="social in socials"
                :key="social.name"
                href="#"
                class="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-primary/15 flex items-center justify-center transition-all duration-300 group hover:scale-110 hover:shadow-lg hover:shadow-brand-primary/10"
                :title="social.name"
              >
                <svg class="w-[18px] h-[18px] fill-slate-400 group-hover:fill-brand-primary transition-colors duration-300" viewBox="0 0 24 24" v-html="social.icon" />
              </a>
            </div>
          </div>

          <div v-for="section in sections" :key="section.title" class="sm:col-span-1 lg:col-span-2">
            <h4 class="text-xs font-bold text-white/90 mb-5 relative inline-block">
              {{ section.title }}
              <span class="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-brand-primary/50" :class="isRtl ? 'right-0' : 'left-0'"></span>
            </h4>
            <ul class="space-y-3">
              <li v-for="link in section.links" :key="link.label">
                <router-link
                  :to="link.to"
                  class="text-sm text-slate-400 hover:text-white transition-all duration-200 flex items-center gap-2 group/link"
                >
                  <span class="w-1 h-1 rounded-full bg-slate-600 group-hover/link:bg-brand-primary transition-all duration-200 group-hover/link:w-2"></span>
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="sm:col-span-2 lg:col-span-5">
            <div class="bg-white/[0.03] border border-white/5 rounded-2xl p-6 lg:p-7">
              <h4 class="text-xs font-bold text-white/90 mb-1">{{ t('subscription.emailLabel') }}</h4>
              <p class="text-sm text-slate-400 mb-5">{{ t('subscription.description') || $t('footer.description') }}</p>
              <SubscribeForm />
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="border-t border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-xs text-slate-500">&copy; {{ new Date().getFullYear() }} HES Connect. {{ $t('footer.rights') }}</p>
        <div class="flex items-center gap-1">
          <router-link to="/privacy" class="px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">{{ $t('footer.privacy') }}</router-link>
          <router-link to="/terms" class="px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">{{ $t('footer.terms') }}</router-link>
          <button
            @click="scrollToTop"
            class="ml-2 w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-primary/20 flex items-center justify-center transition-all duration-300 group hover:-translate-y-0.5"
            :title="t('backToTop') || 'Back to top'"
          >
            <svg class="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
