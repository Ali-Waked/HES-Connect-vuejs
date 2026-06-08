<script setup>
import ImageUploader from './ImageUploader.vue';

defineProps({
  profile: { type: Object, required: true },
  initials: { type: String, required: true },
  loading: { type: Boolean, default: false },
  avatarUploading: { type: Boolean, default: false },
  coverUploading: { type: Boolean, default: false }
});

defineEmits(['upload-avatar', 'upload-cover']);
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
    <div class="relative h-52 bg-slate-900 sm:h-64">
      <div v-if="loading" class="h-full w-full animate-pulse bg-slate-200"></div>
      <img v-else-if="profile.coverUrl" :src="profile.coverUrl" alt="" class="h-full w-full object-cover" />
      <div v-else class="h-full w-full bg-[linear-gradient(135deg,#0f172a,#0f766e_55%,#f8fafc)]"></div>

      <div class="absolute inset-0 bg-slate-950/25"></div>
      <div class="absolute right-4 top-4">
        <ImageUploader
          label="Change cover"
          :loading="coverUploading"
          @upload="$emit('upload-cover', $event)"
        />
      </div>
    </div>

    <div class="relative px-5 pb-6 pt-0 sm:px-8">
      <div class="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="relative h-28 w-28 rounded-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl sm:h-32 sm:w-32">
            <div v-if="loading" class="h-full w-full animate-pulse rounded-xl bg-slate-200"></div>
            <img v-else-if="profile.avatarUrl" :src="profile.avatarUrl" alt="" class="h-full w-full rounded-xl object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center rounded-xl bg-brand-primary text-3xl font-bold text-white">
              {{ initials }}
            </div>
            <div class="absolute -bottom-2 -right-2">
              <ImageUploader
                label="Avatar"
                compact
                :loading="avatarUploading"
                @upload="$emit('upload-avatar', $event)"
              />
            </div>
          </div>

          <div class="pb-1">
            <div v-if="loading" class="space-y-3">
              <div class="h-7 w-56 animate-pulse rounded bg-slate-200"></div>
              <div class="h-4 w-72 animate-pulse rounded bg-slate-100"></div>
            </div>
            <template v-else>
              <div class="flex flex-wrap items-center gap-3">
                <h1 class="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">{{ profile.fullName }}</h1>
                <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {{ profile.role }}
                </span>
              </div>
              <p class="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span class="material-symbols-outlined text-[18px]">mail</span>
                {{ profile.email }}
              </p>
            </template>
          </div>
        </div>

        <router-link
          to="/admin/dashboard"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <span class="material-symbols-outlined text-[18px]">dashboard</span>
          Dashboard
        </router-link>
      </div>
    </div>
  </section>
</template>
