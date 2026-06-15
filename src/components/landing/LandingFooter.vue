<script setup>
import { useI18n } from 'vue-i18n'
import HesLogo from '@/components/global/HesLogo.vue'

const { t } = useI18n()

const sections = [
  {
    title: 'Quick Links',
    links: [
      { label: t('nav.home'), to: '/' },
      { label: t('nav.facilities'), to: '/facilities' },
      { label: t('nav.doctors'), to: '/doctors' },
      { label: t('nav.about'), to: '/about' },
      { label: t('nav.contact'), to: '/contact' },
    ]
  },
  {
    title: 'Services',
    links: [
      { label: 'Find Hospitals', to: '/facilities' },
      { label: 'Find Doctors', to: '/doctors' },
      { label: 'Health Articles', to: '/articles' },
      { label: 'Contact Support', to: '/contact' },
    ]
  },
]

const socials = [
  { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
  { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
  { name: 'Instagram', icon: 'M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm3.5-6.5a1 1 0 110-2 1 1 0 010 2z' },
  { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z' },
]
</script>

<template>
  <footer class="bg-slate-900 dark:bg-slate-950 text-slate-300">
    <div class="relative">
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent"></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-12 lg:py-16">
        <div class="grid sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          <div class="sm:col-span-2 lg:col-span-4 space-y-5">
            <div class="flex items-center">
              <HesLogo variant="full" :height="32" theme="dark" />
            </div>
            <p class="text-sm text-slate-400 leading-relaxed max-w-xs">
              HES Connect is a healthcare ecosystem platform that connects healthcare facilities, doctors, organizations, and services across the Gaza Strip.
            </p>
            <div class="flex gap-2">
              <a
                v-for="social in socials"
                :key="social.name"
                href="#"
                class="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-primary/20 flex items-center justify-center transition-all duration-200 group"
                :title="social.name"
              >
                <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="social.icon"/>
                </svg>
              </a>
            </div>
          </div>

          <div v-for="section in sections" :key="section.title" class="sm:col-span-1 lg:col-span-2">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">{{ section.title }}</h4>
            <ul class="space-y-2.5">
              <li v-for="link in section.links" :key="link.label">
                <router-link
                  :to="link.to"
                  class="text-sm text-slate-400 hover:text-white transition flex items-center gap-2"
                >
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="sm:col-span-2 lg:col-span-4">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">{{ t('nav.contact') }}</h4>
            <ul class="space-y-3 text-sm text-slate-400">
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L5.25 8.566a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
                <span>info@hesconnect.ps</span>
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                </svg>
                <span>+970 59 000 0000</span>
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                </svg>
                <span>Gaza, Palestine</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>&copy; {{ new Date().getFullYear() }} HES Connect. All rights reserved.</p>
        <div class="flex gap-6">
          <a href="#" class="hover:text-white hover:underline transition-all duration-200">Privacy Policy</a>
          <a href="#" class="hover:text-white hover:underline transition-all duration-200">Terms of Service</a>
          <router-link to="/contact" class="hover:text-white hover:underline transition-all duration-200">Contact Us</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>
