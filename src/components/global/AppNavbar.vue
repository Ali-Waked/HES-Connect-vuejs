<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useScrollNavbar } from '@/composables/useScrollNavbar'
import LanguageSwitcher from '@/components/global/LanguageSwitcher.vue'
import HesLogo from '@/components/global/HesLogo.vue'
import NotificationsDropdown from '@/components/dashboard/global/NotificationsDropdown.vue'
import UserProfileDropdown from '@/components/dashboard/global/UserProfileDropdown.vue'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '@/composables/useDarkMode'
import { resolveTranslatedValue } from '@/utils/locale'

const props = defineProps({
  variant: { type: String, default: 'landing' },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['toggleMobile'])

const { t } = useI18n()
const { isDark, toggleDarkMode } = useDarkMode()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificationsStore()
const { isScrolled } = useScrollNavbar(10)

const mobileOpen = ref(false)
const activeSection = ref('home')
const isHeroTop = computed(() => route.path === '/' && !isScrolled.value)

let sectionObserver = null

const navLinks = computed(() => [
  { id: 'home', label: t('nav.home'), href: '#home', type: 'section' },
  { id: 'facilities', label: t('nav.facilities'), href: '/facilities', type: 'route', path: '/facilities' },
  { id: 'doctors', label: t('nav.doctors'), href: '/doctors', type: 'route', path: '/doctors' },
  { id: 'about', label: t('nav.about'), href: '/about', type: 'route', path: '/about' },
  { id: 'contact', label: t('nav.contact'), href: '/contact', type: 'route', path: '/contact' },
])

const isLandingPage = computed(() => route.path === '/')

function isLinkActive(link) {
  if (link.type === 'route') return route.path.startsWith(link.path)
  if (!isLandingPage.value) return false
  return activeSection.value === link.id
}

function setupScrollSpy() {
  sectionObserver?.disconnect()
  if (route.path !== '/') return
  const sectionIds = ['home']
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible.length > 0) activeSection.value = visible[0].target.id
    },
    { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.7] }
  )
  sectionIds.forEach(id => {
    const el = document.getElementById(id)
    if (el) sectionObserver.observe(el)
  })
}

async function navigate(link) {
  mobileOpen.value = false
  const href = typeof link === 'string' ? link : link.href
  if (href.startsWith('#')) {
    const sectionId = href.slice(1)
    if (route.path !== '/') {
      await router.push('/')
      await nextTick()
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
        activeSection.value = sectionId
      }, 120)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      activeSection.value = sectionId
    }
    return
  }
  router.push(href)
}

const showNotifications = ref(false)
const showProfileMenu = ref(false)
const tabTitle = computed(() => {
  if (!route.name) return ''
  const name = String(route.name)
  if (name === 'story-detail') return 'Stories'
  if (name === 'staff') return 'Users'
  if (name === 'patients') return 'Users'
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
})

const toggleNotifications = () => { showProfileMenu.value = false; showNotifications.value = !showNotifications.value }
const closeNotifications = () => { showNotifications.value = false }
const toggleProfileMenu = () => { showNotifications.value = false; showProfileMenu.value = !showProfileMenu.value }
const closeProfileMenu = () => { showProfileMenu.value = false }

onMounted(() => { if (props.variant === 'landing') setupScrollSpy() })
onUnmounted(() => sectionObserver?.disconnect())
watch(() => route.path, async () => {
  if (props.variant !== 'landing') return
  await nextTick()
  setupScrollSpy()
})
</script>

<template>
  <template v-if="variant === 'landing'">
    <header
      v-if="loading"
      class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 h-16 lg:h-[76px]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div class="flex items-center justify-between h-full">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 skeleton-shimmer rounded-xl"></div>
            <div class="w-36 h-4 skeleton-shimmer rounded-lg hidden sm:block"></div>
          </div>
          <div class="hidden lg:flex items-center gap-6">
            <div v-for="i in 5" :key="i" class="w-14 h-3 skeleton-shimmer rounded"></div>
          </div>
          <div class="hidden lg:flex items-center gap-3">
            <div class="w-14 h-9 skeleton-shimmer rounded-xl"></div>
            <div class="w-24 h-9 skeleton-shimmer rounded-xl"></div>
          </div>
          <div class="lg:hidden w-6 h-6 skeleton-shimmer rounded"></div>
        </div>
      </div>
    </header>

    <header
      v-else
      class="fixed inset-x-0 top-0 z-50 transition-all duration-500 h-16 lg:h-[68px]"
      :class="isHeroTop
        ? 'bg-transparent'
        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/40 dark:border-slate-700/40 shadow-glass'"
    >
      <div class="max-w-full 2xl:max-w-7xl 2xl:mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div class="flex items-center justify-between h-full">
          <button
            class="flex items-center cursor-pointer group shrink-0"
            @click="navigate('#home')"
          >
            <HesLogo
              :height="34"
              variant="full"
              :theme="isHeroTop ? 'white' : (isDark ? 'dark' : 'light')"
            />
          </button>

          <nav class="hidden lg:flex items-center">
            <div class="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl p-1"
              :class="isHeroTop ? 'bg-white/10 backdrop-blur-sm' : ''"
            >
              <button
                v-for="link in navLinks"
                :key="link.id"
                class="relative px-4 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                :class="isLinkActive(link)
                  ? isHeroTop
                    ? 'text-white bg-white/20'
                    : 'text-brand-primary bg-white dark:bg-slate-800 shadow-sm'
                  : isHeroTop
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'"
                @click="navigate(link)"
              >
                {{ link.label }}
              </button>
            </div>
          </nav>

          <div class="hidden lg:flex items-center gap-2">
            <button
              class="p-2 rounded-xl transition-all duration-200 cursor-pointer"
              :class="isHeroTop
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
              @click="toggleDarkMode"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-[18px] h-[18px]">
                <path stroke-linecap="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-[18px] h-[18px]">
                <path stroke-linecap="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
              </svg>
            </button>

            <LanguageSwitcher :overlay="isHeroTop" />

            <div class="w-px h-6 mx-1" :class="isHeroTop ? 'bg-white/15' : 'bg-slate-200 dark:bg-slate-700'"></div>

            <template v-if="authStore.authenticated">
              <button
                class="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all duration-200 cursor-pointer"
                :class="isHeroTop
                  ? 'hover:bg-white/10'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'"
                @click="router.push('/profile')"
              >
                <div class="w-7 h-7 bg-brand-primary text-white font-bold rounded-full flex items-center justify-center text-[11px] ring-2 ring-white/20 shrink-0">
                  {{ authStore.user?.initials }}
                </div>
                <span
                  class="text-sm font-medium hidden xl:inline"
                  :class="isHeroTop ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'"
                >{{ resolveTranslatedValue(authStore.user?.name).split(' ')[0] || 'Profile' }}</span>
              </button>
            </template>
            <template v-else>
              <button
                class="px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
                :class="isHeroTop
                  ? 'text-white/90 border border-white/25 hover:bg-white/10 hover:border-white/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
                @click="router.push('/login')"
              >{{ $t('nav.login') }}</button>
              <button
                class="px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/25"
                :class="isHeroTop
                  ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
                  : 'bg-brand-primary hover:bg-brand-primary-hover'"
                @click="router.push('/register')"
              >{{ $t('nav.register') }}</button>
            </template>
          </div>

          <button
            class="lg:hidden p-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            :class="isHeroTop
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'"
            @click="mobileOpen = !mobileOpen"
          >
            <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="mobileOpen" class="lg:hidden border-t border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-1">
            <button
              v-for="link in navLinks"
              :key="link.id"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition cursor-pointer"
              :class="isLinkActive(link)
                ? 'bg-brand-primary-light dark:bg-brand-primary/20 text-brand-primary font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
              @click="navigate(link)"
            >
              {{ link.label }}
            </button>

            <div class="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div class="flex items-center justify-center gap-5">
                <button
                  class="p-2.5 rounded-xl transition cursor-pointer text-slate-500 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                  @click="toggleDarkMode"
                >
                  <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
                  </svg>
                </button>
                <LanguageSwitcher />
              </div>

              <template v-if="authStore.authenticated">
                <button
                  class="w-full py-3 text-sm font-semibold text-brand-primary border border-brand-primary/20 rounded-xl cursor-pointer hover:bg-brand-primary/5 transition"
                  @click="router.push('/profile'); mobileOpen = false"
                >{{ $t('nav.profile') }}</button>
              </template>
              <template v-else>
                <div class="flex gap-2">
                  <button
                    class="flex-1 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    @click="router.push('/login'); mobileOpen = false"
                  >{{ $t('nav.login') }}</button>
                  <button
                    class="flex-1 py-3 text-sm font-semibold text-white bg-brand-primary rounded-xl cursor-pointer hover:bg-brand-primary-hover transition shadow-lg shadow-brand-primary/20"
                    @click="router.push('/register'); mobileOpen = false"
                  >{{ $t('nav.register') }}</button>
                </div>
              </template>
            </div>
          </nav>
        </div>
      </transition>
    </header>
  </template>

  <template v-else-if="variant === 'dashboard'">
    <header
      v-if="loading"
      class="h-[64px] bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 w-full backdrop-blur-2xl"
    >
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 skeleton-shimmer rounded lg:hidden"></div>
        <div class="w-32 h-5 skeleton-shimmer rounded-lg"></div>
      </div>
      <div class="flex items-center gap-4 lg:gap-5">
        <div class="w-9 h-9 skeleton-shimmer rounded-full"></div>
        <div class="hidden sm:flex items-center gap-2">
          <div class="w-9 h-9 skeleton-shimmer rounded-full"></div>
          <div class="w-24 h-4 skeleton-shimmer rounded-lg"></div>
        </div>
      </div>
    </header>

    <header
      v-else
      class="h-[64px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 w-full shadow-sm"
    >
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition"
          @click="$emit('toggleMobile')"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
          </svg>
        </button>
        <span class="text-base lg:text-lg font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{{ tabTitle }}</span>
      </div>

      <div class="flex items-center gap-2 lg:gap-3">
        <button
          class="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition"
          @click="toggleDarkMode"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-[18px] h-[18px]">
            <path stroke-linecap="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-[18px] h-[18px]">
            <path stroke-linecap="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
          </svg>
        </button>
        <LanguageSwitcher />
        <div class="relative">
          <button
            class="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition"
            title="Notifications"
            @click="toggleNotifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-[18px] h-[18px]">
              <path stroke-linecap="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
            </svg>
            <span
              v-if="notifStore.unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-white leading-none"
            >{{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}</span>
          </button>
          <NotificationsDropdown v-if="showNotifications" @close="closeNotifications" />
        </div>

        <div v-if="authStore.user" class="relative">
          <button
            class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-2.5 rounded-xl transition"
            @click="toggleProfileMenu"
          >
            <div class="w-7 h-7 bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-bold rounded-full flex items-center justify-center text-[11px] shadow-sm shrink-0">
              {{ authStore.user.initials }}
            </div>
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none mb-0.5">{{ resolveTranslatedValue(authStore.user?.name) }}</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 leading-none">{{ authStore.user.email }}</span>
            </div>
            <svg
              class="w-3 h-3 text-slate-400 transition-transform duration-200"
              :class="showProfileMenu ? 'rotate-180' : ''"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
            >
              <path stroke-linecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </button>
          <UserProfileDropdown v-if="showProfileMenu" @close="closeProfileMenu" />
        </div>
      </div>
    </header>
  </template>
</template>
