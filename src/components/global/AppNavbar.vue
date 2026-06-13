<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { useScrollNavbar } from '@/composables/useScrollNavbar';
import LanguageSwitcher from '@/components/global/LanguageSwitcher.vue';
import NotificationsDropdown from '@/components/dashboard/global/NotificationsDropdown.vue';
import UserProfileDropdown from '@/components/dashboard/global/UserProfileDropdown.vue';
import { useI18n } from 'vue-i18n';
import { useDarkMode } from '@/composables/useDarkMode';

const props = defineProps({
  variant: { type: String, default: 'landing' },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['toggleMobile']);

const { t } = useI18n();
const { isDark, toggleDarkMode } = useDarkMode();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notifStore = useNotificationsStore();
const { isScrolled } = useScrollNavbar(10);

// ── landing only ──────────────────────────────────────────────────────

const mobileOpen = ref(false);
const activeSection = ref('home');
const isHeroTop = computed(() => route.path === '/' && !isScrolled.value);

let sectionObserver = null;

const navLinks = computed(() => [
  { id: 'home', label: t('nav.home'), href: '#home', type: 'section' },
  { id: 'facilities', label: t('nav.facilities'), href: '/facilities', type: 'route', path: '/facilities' },
  { id: 'doctors', label: t('nav.doctors'), href: '/doctors', type: 'route', path: '/doctors' },
  { id: 'pharmacies', label: t('nav.pharmacies'), href: '/facilities?type=pharmacy', type: 'route', path: '/facilities', query: { type: 'pharmacy' } },
  { id: 'stories', label: t('nav.stories'), href: '/stories', type: 'route', path: '/stories' },
  { id: 'about', label: t('nav.about'), href: '/about', type: 'route', path: '/about' },
  { id: 'contact', label: t('nav.contact'), href: '/contact', type: 'route', path: '/contact' },
]);

function isLinkActive(link) {
  if (link.type === 'route') {
    if (route.path !== link.path) return false;
    if (link.query) {
      return route.query.type === link.query.type;
    }
    return route.query.type !== 'pharmacy';
  }
  if (route.path !== '/') return false;
  return activeSection.value === (link.sectionId || link.id);
}

function linkClasses(link) {
  const active = isLinkActive(link);
  return active
    ? 'bg-brand-primary text-white font-semibold shadow-sm shadow-brand-primary/20'
    : 'text-landing-muted hover:text-brand-primary hover:bg-brand-primary/8';
}

function mobileLinkClasses(link) {
  const active = isLinkActive(link);
  return active
    ? 'bg-brand-primary/10 text-brand-primary font-semibold border-l-[3px] border-brand-primary'
    : 'text-stone-700 hover:bg-brand-primary/5 border-l-[3px] border-transparent';
}

function setupScrollSpy() {
  sectionObserver?.disconnect();
  if (route.path !== '/') return;

  const sectionIds = ['home'];
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length > 0) {
        activeSection.value = visible[0].target.id;
      }
    },
    { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.7] }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });
}

async function navigate(link) {
  mobileOpen.value = false;
  const href = typeof link === 'string' ? link : link.href;

  if (href.startsWith('#')) {
    const sectionId = href.slice(1);
    if (route.path !== '/') {
      await router.push('/');
      await nextTick();
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        activeSection.value = sectionId;
      }, 120);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      activeSection.value = sectionId;
    }
    return;
  }

  router.push(href);
}

// ── dashboard only ────────────────────────────────────────────────────

const showNotifications = ref(false);
const showProfileMenu = ref(false);

const tabTitle = computed(() => {
  if (!route.name) return '';
  const name = String(route.name);
  if (name === 'story-detail') return 'Stories';
  if (name === 'staff') return 'Users';
  if (name === 'patients') return 'Users';
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
});

const toggleNotifications = () => {
  showProfileMenu.value = false;
  showNotifications.value = !showNotifications.value;
};

const closeNotifications = () => {
  showNotifications.value = false;
};

const toggleProfileMenu = () => {
  showNotifications.value = false;
  showProfileMenu.value = !showProfileMenu.value;
};

const closeProfileMenu = () => {
  showProfileMenu.value = false;
};

// ── lifecycle ─────────────────────────────────────────────────────────

onMounted(() => {
  if (props.variant === 'landing') {
    setupScrollSpy();
  }
});

onUnmounted(() => {
  sectionObserver?.disconnect();
});

watch(() => route.path, async () => {
  if (props.variant !== 'landing') return;
  await nextTick();
  setupScrollSpy();
});
</script>

<template>
  <!-- ─── LANDING VARIANT ────────────────────────────────────────── -->
  <template v-if="variant === 'landing'">
    <!-- Skeleton -->
    <header
      v-if="loading"
      class="fixed inset-x-0 top-0 z-50 bg-landing-cream/95/95 backdrop-blur-md border-b border-landing-border shadow-md shadow-slate-900/5 h-16 lg:h-[70px]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div class="flex items-center justify-between h-full">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 skeleton-shimmer rounded-xl"></div>
            <div class="w-36 h-4 skeleton-shimmer rounded-lg hidden sm:block"></div>
          </div>
          <div class="hidden lg:flex items-center gap-1">
            <div v-for="i in 7" :key="i" class="w-16 h-8 skeleton-shimmer rounded-lg"></div>
          </div>
          <div class="hidden lg:flex items-center gap-3">
            <div class="w-16 h-9 skeleton-shimmer rounded-lg"></div>
            <div class="w-24 h-9 skeleton-shimmer rounded-lg"></div>
          </div>
          <div class="lg:hidden w-6 h-6 skeleton-shimmer rounded"></div>
        </div>
      </div>
    </header>
    <!-- Real -->
    <header
      v-else
      class="fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-out"
      :class="isHeroTop
        ? 'border-b-[#80808038] bg-[linear-gradient(45deg,#d7e2de,#ffffff1c)][linear-gradient(45deg,#0f172a,#1e293b88)] shadow-none backdrop-blur-0'
        : 'bg-landing-cream/95/95 backdrop-blur-md border-landing-border shadow-md shadow-slate-900/5'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-[70px]">
          <button class="flex items-center gap-2.5 cursor-pointer group" @click="navigate('#home')">
            <div class="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-primary/25 group-hover:bg-brand-primary-hover transition">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-landing-dark tracking-tight">
              Health <span class="text-brand-primary">Garagantam</span>
            </span>
          </button>

          <nav
            class="hidden lg:flex items-center gap-1 p-1 rounded-xl border transition-all duration-300"
            :class="isHeroTop
              ? 'bg-landing-cream/55 border-white/40 backdrop-blur-sm'
              : 'bg-landing-warm/60/60 border-landing-border/70/70'"
          >
            <button
              v-for="link in navLinks"
              :key="link.id"
              class="px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
              :class="linkClasses(link)"
              @click="navigate(link)"
            >{{ link.label }}</button>
          </nav>

          <div class="hidden lg:flex items-center gap-2">
            <button
              class="p-2 text-landing-muted hover:text-brand-primary hover:bg-brand-primary/8 rounded-lg cursor-pointer transition"
              @click="toggleDarkMode"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            </button>
            <LanguageSwitcher />
            <template v-if="authStore.isAuthenticated">
              <button
                class="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-brand-primary/8 transition cursor-pointer"
                @click="router.push('/profile')"
              >
                <div class="w-9 h-9 bg-brand-primary text-white font-bold rounded-full flex items-center justify-center text-sm ring-2 ring-brand-primary/20">
                  {{ authStore.user?.initials }}
                </div>
              </button>
            </template>
            <template v-else>
              <button
                class="px-4 py-2 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary/8 transition cursor-pointer"
                @click="router.push('/login')"
              >{{ $t('nav.login') }}</button>
              <button
                class="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg shadow-md shadow-brand-primary/20 transition cursor-pointer"
                @click="router.push('/register')"
              >{{ $t('nav.register') }}</button>
            </template>
          </div>

          <button
            class="lg:hidden p-2 text-landing-muted hover:text-brand-primary hover:bg-brand-primary/8 rounded-lg cursor-pointer transition"
            @click="mobileOpen = !mobileOpen"
          >
            <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        class="lg:hidden overflow-hidden transition-all duration-300 border-t border-landing-border bg-landing-cream"
        :class="mobileOpen ? 'max-h-[530px] opacity-100' : 'max-h-0 opacity-0'"
      >
        <nav class="px-4 py-4 space-y-1">
          <button
            v-for="link in navLinks"
            :key="link.id"
            class="w-full text-left px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition"
            :class="mobileLinkClasses(link)"
            @click="navigate(link)"
          >{{ link.label }}</button>
          <div class="pt-3 border-t border-landing-border flex flex-col gap-2">
            <div class="flex justify-center items-center gap-4 py-1">
              <button
                class="p-2 text-landing-muted hover:text-brand-primary rounded-lg cursor-pointer transition"
                @click="toggleDarkMode"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              </button>
              <LanguageSwitcher />
            </div>
            <template v-if="authStore.isAuthenticated">
              <button class="w-full py-2.5 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg cursor-pointer" @click="router.push('/profile'); mobileOpen = false">{{ $t('nav.profile') }}</button>
            </template>
            <template v-else>
              <button class="w-full py-2.5 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg cursor-pointer" @click="router.push('/login'); mobileOpen = false">{{ $t('nav.login') }}</button>
              <button class="w-full py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg cursor-pointer" @click="router.push('/register'); mobileOpen = false">{{ $t('nav.register') }}</button>
            </template>
          </div>
        </nav>
      </div>
    </header>
  </template>

  <!-- ─── DASHBOARD VARIANT ─────────────────────────────────────────── -->
  <template v-else-if="variant === 'dashboard'">
    <!-- Skeleton -->
    <header
      v-if="loading"
      class="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 w-full"
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
    <!-- Real -->
    <header
      v-else
      class="h-[70px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 w-full transition-all duration-300"
    >
      <!-- Left: page title + mobile menu -->
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('toggleMobile')"
        >
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <span class="text-base lg:text-lg font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{{ tabTitle }}</span>
      </div>

      <!-- Right: bell + profile -->
      <div class="flex items-center gap-4 lg:gap-5">
        <button
          class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full cursor-pointer transition"
          @click="toggleDarkMode"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </button>
        <LanguageSwitcher />
        <!-- Bell wrapper -->
        <div class="relative">
          <button
            class="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full cursor-pointer transition"
            title="Notifications"
            @click="toggleNotifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
            </svg>
            <span
              v-if="notifStore.unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-white leading-none"
            >{{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}</span>
          </button>

          <NotificationsDropdown
            v-if="showNotifications"
            @close="closeNotifications"
          />
        </div>

        <!-- User Profile -->
        <div v-if="authStore.user" class="relative">
          <button
            class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition"
            @click="toggleProfileMenu"
          >
            <div class="w-9 h-9 bg-brand-primary text-white font-bold rounded-full flex items-center justify-center text-sm shadow-xs shadow-brand-primary/10">
              {{ authStore.user.initials }}
            </div>
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none mb-0.5">{{ authStore.user.name }}</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 leading-none">{{ authStore.user.email }}</span>
            </div>
            <svg
              class="w-4 h-4 text-slate-400 transition-transform"
              :class="showProfileMenu ? 'rotate-180' : ''"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </button>

          <UserProfileDropdown
            v-if="showProfileMenu"
            @close="closeProfileMenu"
          />
        </div>
      </div>
    </header>
  </template>
</template>

<style scoped>
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 50%,
    #e2e8f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
</style>
