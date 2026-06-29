<script setup>
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import ImageUploader from './ImageUploader.vue'

const { locale } = useI18n()

defineProps({
  profile: { type: Object, default: null },
  initials: { type: String, default: 'U' },
  loading: { type: Boolean, default: false },
  avatarUploading: { type: Boolean, default: false },
  coverUploading: { type: Boolean, default: false },
})

defineEmits(['upload-avatar', 'upload-cover'])
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
    <!-- Cover -->
    <div class="relative h-40 sm:h-52">
      <img v-if="profile?.coverUrl" :src="profile.coverUrl" alt="" class="h-full w-full object-cover" />
      <div v-else class="h-full bg-gradient-to-br from-brand-primary via-brand-accent to-brand-primary/60" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <div class="absolute right-4 top-4">
        <ImageUploader
          label="Change cover"
          :loading="coverUploading"
          @upload="$emit('upload-cover', $event)"
        />
      </div>
    </div>

    <!-- Avatar + Info -->
    <div class="px-6 sm:px-8 pb-6 sm:pb-8">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
            <img v-if="profile?.avatarUrl" :src="profile.avatarUrl" alt="" class="h-full w-full object-cover" />
            <div v-else class="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent text-2xl sm:text-3xl font-bold text-white">
              {{ initials }}
            </div>
          </div>
          <div class="absolute -bottom-1 -right-1">
            <ImageUploader
              label="Avatar"
              compact
              :loading="avatarUploading"
              @upload="$emit('upload-avatar', $event)"
            />
          </div>
        </div>

        <!-- Name + Badges -->
        <div class="pb-1 sm:pb-2 flex-1 min-w-0">
          <div v-if="loading" class="space-y-2">
            <div class="h-7 w-56 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div class="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <template v-else-if="profile">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {{ profile.name_display || resolveTranslatedValue(profile.name, locale) }}
            </h1>
            <div class="flex flex-wrap items-center gap-2 mt-2">
              <span v-if="profile.role || profile.type" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
                {{ profile.role || profile.type }}
              </span>
              <span v-if="profile.status" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                :class="profile.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="profile.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'" />
                {{ profile.status }}
              </span>
              <span v-if="profile.email" class="text-sm text-slate-400 dark:text-slate-500">
                {{ profile.email }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
