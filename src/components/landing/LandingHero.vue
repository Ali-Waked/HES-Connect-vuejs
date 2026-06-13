<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LandingSkeleton from './LandingSkeleton.vue';
import heroBackground from '../../assets/background.png';

defineProps({
  stats: { type: Object, default: null },
  loading: { type: Boolean, default: true }
});

const router = useRouter();
const { t } = useI18n();
const searchQuery = ref('');

const statItems = computed(() => [
  { key: 'hospitals', label: t('stats.hospitals') },
  { key: 'doctors', label: t('stats.doctors') },
  { key: 'pharmacies', label: t('stats.pharmacies') },
  { key: 'patients', label: t('stats.patients') }
]);

function handleSearch() {
  router.push({ path: '/facilities', query: searchQuery.value ? { q: searchQuery.value } : {} });
}
</script>

<template>
  <section
    id="home"
    class="relative bg-cover bg-[center_right] bg-no-repeat pt-28 pb-16 lg:pt-32 lg:pb-20 rtl:bg-[center_left]"
    :style="{ backgroundImage: `url(${heroBackground})` }"
  >
    <!-- Warm cream fade (matches map land tone) + soft teal tint over the sea on the left -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#f5f1ea]/95/95 from-0% via-[#faf8f4]/55/55 via-[38%] to-transparent to-[62%] rtl:bg-gradient-to-bl dark:from-slate-900/95 dark:via-slate-950/55"></div>
    <div class="absolute inset-0 bg-gradient-to-br from-brand-primary/8 via-transparent to-transparent rtl:bg-gradient-to-bl"></div>
    <div class="absolute inset-0 bg-gradient-to-l from-[#faf8f4]/25/25 via-transparent to-transparent rtl:bg-gradient-to-r dark:from-slate-950/25"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl space-y-6">
        <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full uppercase tracking-wider">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
          {{ $t('hero.eyebrow') }}
        </span>

        <h1 class="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-tight tracking-tight rtl:text-right dark:text-white">
          <span v-if="$i18n.locale === 'ar'">رعاية صحية أفضل<br /><span class="text-brand-primary">لغزة</span></span>
          <span v-else>Better Healthcare<br /><span class="text-brand-primary">For Gaza</span></span>
        </h1>

        <p class="text-slate-500 text-lg leading-relaxed rtl:text-right dark:text-slate-400">
          {{ $t('hero.subtitle') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-grow">
            <svg class="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('hero.searchPlaceholder')"
              class="w-full pl-11 pr-4 rtl:pr-11 rtl:pl-4 py-3.5 text-sm text-slate-900 border border-landing-border rounded-xl bg-landing-cream/90/90 backdrop-blur-sm shadow-sm placeholder-slate-400 rtl:text-right dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:placeholder-slate-500"
              @keyup.enter="handleSearch"
            />
          </div>
          <button
            class="px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/20 transition cursor-pointer shrink-0"
            @click="handleSearch"
          >{{ $t('hero.search') }}</button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <template v-if="loading">
            <LandingSkeleton variant="stat" :count="4" />
          </template>
          <template v-else>
            <div
              v-for="item in statItems"
              :key="item.key"
              class="bg-landing-cream/90/90 backdrop-blur-sm rounded-xl border border-landing-border px-4 py-3.5 shadow-sm text-center"
            >
              <p class="text-2xl font-extrabold text-slate-900 dark:text-white">{{ stats?.[item.key] ?? 0 }}+</p>
              <p class="text-xs font-medium text-slate-500 mt-0.5 dark:text-slate-400">{{ item.label }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
