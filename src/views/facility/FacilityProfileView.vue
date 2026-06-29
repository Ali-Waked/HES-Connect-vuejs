<script setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import ProfileSecurityCard from '@/components/profile/ProfileSecurityCard.vue'
import ProfileRolesCard from '@/components/profile/ProfileRolesCard.vue'

const { t } = useI18n()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const profile = computed(() => profileStore.profile)
const user = computed(() => authStore.user)
const roles = computed(() => authStore.systemRoles || [])
const permissions = computed(() => authStore.systemPermissions || [])

onMounted(async () => {
  await profileStore.fetchProfile()
})

async function handleSave(formData) {
  const cleaned = Object.fromEntries(
    Object.entries(formData).filter(([, val]) => {
      if (val === null || val === undefined) return false
      if (typeof val === 'string' && val.trim() === '') return false
      return true
    })
  )
  if (formData.name && typeof formData.name === 'object') {
    cleaned.name = Object.fromEntries(
      Object.entries(formData.name).filter(([, v]) => v !== null && v !== undefined && v !== '')
    )
  }
  const result = await profileStore.updateProfile(cleaned)
  if (result.success) {
    dashboardStore.addToast(t('profile.updated') || 'Profile updated successfully', 'success')
  } else {
    if (!Object.keys(result.errors || {}).length) {
      dashboardStore.addToast(result.error || t('profile.updateFailed') || 'Profile update failed', 'error')
    }
  }
}

async function handleUploadAvatar(file) {
  try {
    await profileStore.uploadAvatar(file)
    dashboardStore.addToast('Profile image updated', 'success')
  } catch {
    dashboardStore.addToast('Profile image upload failed', 'error')
  }
}

async function handleUploadCover(file) {
  try {
    await profileStore.uploadCover(file)
    dashboardStore.addToast('Cover image updated', 'success')
  } catch {
    dashboardStore.addToast('Cover image upload failed', 'error')
  }
}
</script>

<template>
  <div class="animate-fade-in max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and personal information</p>
      </div>
    </div>

    <div v-if="profileStore.error && !profile" class="rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
          <span class="material-symbols-outlined text-lg">error</span>
          <span>{{ profileStore.error }}</span>
        </div>
        <button class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 underline transition cursor-pointer" @click="profileStore.fetchProfile()">Retry</button>
      </div>
    </div>

    <div v-if="profileStore.loading" class="space-y-6">
      <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div class="h-40 sm:h-52 bg-slate-100 dark:bg-slate-700 animate-pulse" />
        <div class="px-6 sm:px-8 pb-6">
          <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 dark:bg-slate-600 animate-pulse border-4 border-white dark:border-slate-800 shadow-lg" />
            <div class="space-y-3 flex-1 pb-2">
              <div class="h-7 w-56 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div class="h-4 w-36 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div v-for="n in 5" :key="n" class="h-11 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
        <div class="space-y-6">
          <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div v-for="n in 3" :key="n" class="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="profile">
      <div v-if="profileStore.error" class="rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 p-4 flex items-start gap-3">
        <span class="material-symbols-outlined text-rose-500 shrink-0">error</span>
        <div class="flex-1">
          <p class="text-sm font-semibold text-rose-700 dark:text-rose-400">{{ profileStore.error }}</p>
          <div v-if="Object.keys(profileStore.errors).length" class="mt-2 space-y-1">
            <p v-for="(msgs, field) in profileStore.errors" :key="field" class="text-xs text-rose-600 dark:text-rose-300">
              <span class="font-medium">{{ field }}:</span> {{ Array.isArray(msgs) ? msgs[0] : msgs }}
            </p>
          </div>
        </div>
        <button class="text-rose-400 hover:text-rose-600 transition cursor-pointer" @click="profileStore.error = ''; profileStore.errors = {}">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <ProfileHeader
        :profile="profile"
        :initials="profileStore.initials"
        :loading="profileStore.loading"
        :avatar-uploading="profileStore.uploading.avatar"
        :cover-uploading="profileStore.uploading.cover"
        @upload-avatar="handleUploadAvatar"
        @upload-cover="handleUploadCover"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <ProfileForm
            :profile="profile"
            :saving="profileStore.saving"
            :errors="profileStore.errors"
            @save="handleSave"
          />
        </div>

        <div class="space-y-6">
          <ProfileSecurityCard
            :email="user?.email || profile.email"
            :email-verified-at="user?.email_verified_at || null"
            :provider="user?.provider || ''"
            :created-at="user?.created_at || profile.created_at"
          />

          <ProfileRolesCard
            :roles="roles"
            :permissions="permissions"
          />
        </div>
      </div>
    </template>

    <div v-else class="text-center py-16">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-3xl text-slate-400">person</span>
      </div>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Unable to load profile.</p>
      <button class="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer" @click="profileStore.fetchProfile()">
        Try Again
      </button>
    </div>
  </div>
</template>
