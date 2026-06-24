<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useNotificationsStore } from '@/stores/notifications'
import { useStaffStore } from '@/stores/useStaffStore'
import { useDarkMode } from '@/composables/useDarkMode'
import { resolveTranslatedValue } from '@/utils/locale'
import FacilitySidebar from '@/components/facility/FacilitySidebar.vue'
import NotificationsDropdown from '@/components/dashboard/global/NotificationsDropdown.vue'
import UserProfileDropdown from '@/components/dashboard/global/UserProfileDropdown.vue'
import LanguageSwitcher from '@/components/global/LanguageSwitcher.vue'
import WorkspaceSwitcher from '@/components/global/WorkspaceSwitcher.vue'
import WorkspaceSelectorModal from '@/components/global/WorkspaceSelectorModal.vue'
import StaffToastContainer from '@/components/staff/shared/StaffToastContainer.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const notifStore = useNotificationsStore()
const staffStore = useStaffStore()
const { isDark, toggleDarkMode } = useDarkMode()

const mobileOpen = ref(false)
const showNotifications = ref(false)
const showProfileMenu = ref(false)

function toggleNotifications() {
  showProfileMenu.value = false
  showNotifications.value = !showNotifications.value
}

function toggleProfileMenu() {
  showNotifications.value = false
  showProfileMenu.value = !showProfileMenu.value
}

function closeAll() {
  showNotifications.value = false
  showProfileMenu.value = false
}

const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const crumbs = [{ label: 'Home', to: '/dashboard' }]
  let path = ''
  for (const part of parts.slice(1)) {
    path += '/' + part
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    crumbs.push({ label, to: '/dashboard' + path })
  }
  return crumbs
})

const pageTitle = computed(() => {
  const name = String(route.name || '')
  if (name === 'facility-dashboard') return t('staffSidebar.dashboard')
  if (name === 'facility-profile') return 'My Profile'
  return name
    .replace('facility-', '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100" @click="closeAll">
    <WorkspaceSelectorModal />
    <FacilitySidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <div class="min-h-screen" :class="locale === 'ar' ? 'lg:pr-[260px]' : 'lg:pl-[260px]'">
      <header class="sticky top-0 z-30 h-[64px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between px-6 lg:px-8 shadow-sm">
        <div class="flex items-center gap-3">
          <button
            class="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition"
            @click.stop="mobileOpen = !mobileOpen"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
          </button>
          <nav class="flex items-center gap-1.5 text-sm">
            <template v-for="(crumb, i) in breadcrumbs" :key="crumb.to">
              <router-link
                :to="crumb.to"
                class="font-semibold"
                :class="i === breadcrumbs.length - 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'"
              >
                {{ crumb.label }}
              </router-link>
              <span v-if="i < breadcrumbs.length - 1" class="text-slate-300 dark:text-slate-600">/</span>
            </template>
          </nav>
        </div>

        <div class="flex items-center gap-2 lg:gap-3">
          <WorkspaceSwitcher />
          <button
            class="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition"
            @click.stop="toggleDarkMode"
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
              class="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition"
              title="Notifications"
              @click.stop="toggleNotifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-[18px] h-[18px]">
                <path stroke-linecap="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
              </svg>
              <span v-if="notifStore.unreadCount > 0" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-bold text-white leading-none">
                {{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}
              </span>
            </button>
            <NotificationsDropdown v-if="showNotifications" @close="showNotifications = false" />
          </div>

          <div v-if="authStore.user" class="relative">
            <button
              class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 pr-2.5 rounded-xl transition"
              @click.stop="toggleProfileMenu"
            >
              <div class="w-7 h-7 bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-bold rounded-full flex items-center justify-center text-[11px] shadow-sm shrink-0">
                {{ authStore.user.initials }}
              </div>
              <div class="hidden sm:flex flex-col text-left">
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none mb-0.5">{{ resolveTranslatedValue(authStore.user?.name) }}</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 leading-none">{{ authStore.user.email }}</span>
              </div>
              <svg
                class="w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform duration-200"
                :class="showProfileMenu ? 'rotate-180' : ''"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
              >
                <path stroke-linecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </button>
            <UserProfileDropdown v-if="showProfileMenu" @close="showProfileMenu = false" />
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl p-5 lg:p-8">
        <router-view />
      </main>
    </div>
    <StaffToastContainer />
  </div>
</template>
