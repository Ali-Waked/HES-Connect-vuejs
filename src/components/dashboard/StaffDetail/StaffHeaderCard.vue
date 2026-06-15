<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../../composables/useLocaleField'
import BaseBadge from '../global/BaseBadge.vue'
import { resolveTranslatedValue, getNameInitial } from '../../../utils/locale'

const props = defineProps({
  staff: { type: Object, required: true },
})

const emit = defineEmits(['back'])

const { locale } = useI18n()
const { localField } = useLocaleField()

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500']
const avatarColor = computed(() => {
  const name = localField(props.staff.user, 'name')
  return avatarColors[name ? name.charCodeAt(0) % avatarColors.length : 0]
})

const displayName = computed(() => localField(props.staff.user, 'name'))
const initials = computed(() => getNameInitial(props.staff.user?.name, locale.value))
const specialization = computed(() => localField(props.staff, 'specialization'))
const bio = computed(() => localField(props.staff, 'bio'))
const roleName = computed(() => localField(props.staff.user?.role, 'name'))

const avatarUrl = computed(() => props.staff.user?.avatar || null)
const coverUrl = computed(() => props.staff.user?.cover_image || null)
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

    <!-- Cover Image -->
    <div v-if="coverUrl" class="w-full h-40 md:h-48 overflow-hidden">
      <img :src="coverUrl" alt="Cover" class="w-full h-full object-cover" />
    </div>

    <div class="p-6 md:p-8">
      <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">

        <!-- Avatar -->
        <div class="relative -mt-16 md:-mt-20 shrink-0">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Avatar"
            class="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl shadow-brand-primary/10"
          />
          <div
            v-else
            :class="`w-24 h-24 md:w-28 md:h-28 rounded-2xl ${avatarColor} text-white text-3xl md:text-4xl font-black flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl shadow-brand-primary/10`"
          >
            {{ initials }}
          </div>
        </div>

        <!-- Info -->
        <div class="flex-grow text-center md:text-left space-y-4">
          <!-- Breadcrumb -->
          <nav class="flex items-center justify-center md:justify-start gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <button class="hover:text-brand-primary transition cursor-pointer" @click="$emit('back')">Staff</button>
            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
            <span class="text-slate-600 dark:text-slate-400">Profile Detail</span>
          </nav>

          <h1 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ displayName }}</h1>

          <div class="flex flex-wrap justify-center md:justify-start items-center gap-2.5">
            <BaseBadge v-if="specialization" variant="primary">{{ specialization }}</BaseBadge>
            <BaseBadge v-if="roleName" variant="info">{{ roleName }}</BaseBadge>
            <BaseBadge v-if="staff.experience_years != null" variant="neutral">
              {{ staff.experience_years }} {{ staff.experience_years === 1 ? 'Year' : 'Years' }} Exp
            </BaseBadge>
            <span v-if="staff.user?.last_seen_at" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              Last seen {{ staff.user.last_seen_at }}
            </span>
          </div>

          <p v-if="bio" class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            {{ bio }}
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
          <button class="flex-1 md:w-full px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
            Message Doctor
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
