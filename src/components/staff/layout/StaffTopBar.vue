<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStaffStore } from '../../../stores/useStaffStore';
import AvatarInitial from '../shared/AvatarInitial.vue';
import { useI18n } from 'vue-i18n';
import { resolveTranslatedValue } from '../../../utils/locale';

defineProps({
  title: { type: String, required: true }
});

defineEmits(['toggle-sidebar']);

const router = useRouter();
const store = useStaffStore();
const open = ref(false);
</script>

<template>
  <header class="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
    <div class="flex items-center gap-3">
      <button class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h1 class="text-lg font-bold text-slate-900">{{ title }}</h1>
    </div>

    <div class="flex items-center gap-3">
      <button class="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100" @click="router.push('/facility/messages')">
        <span class="material-symbols-outlined">notifications</span>
        <span v-if="store.totalUnread" class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {{ store.totalUnread }}
        </span>
      </button>

      <div class="relative">
        <button class="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-50" @click="open = !open">
          <AvatarInitial :name="resolveTranslatedValue(store.currentUser.name)" size="sm" />
          <span class="hidden text-sm font-semibold text-slate-700 sm:block">{{ resolveTranslatedValue(store.currentUser.name) }}</span>
          <span class="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
        </button>
        <div v-if="open" class="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <button class="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" @click="router.push('/facility/profile'); open = false">My Profile</button>
          <button class="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50/20" @click="router.push('/')">{{ $t('staffSidebar.logout') }}</button>
        </div>
      </div>
    </div>
  </header>
</template>
