<script setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { usePublicToast } from '@/composables/usePublicToast'
import AppNavbar from '@/components/global/AppNavbar.vue'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import ProfileSecurityCard from '@/components/profile/ProfileSecurityCard.vue'
import ProfileRolesCard from '@/components/profile/ProfileRolesCard.vue'
import TwoFactorSetup from '@/components/profile/TwoFactorSetup.vue'
import PublicToastContainer from '@/components/global/PublicToastContainer.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthAlert from '@/components/auth/AuthAlert.vue'

const { t } = useI18n()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const { addToast } = usePublicToast()

const profile = computed(() => profileStore.profile)
const user = computed(() => authStore.user)
const roles = computed(() => authStore.systemRoles || [])
const permissions = computed(() => authStore.systemPermissions || [])

onMounted(async () => {
  await profileStore.fetchProfile()
})

async function handleSave(formData) {
  const cleaned = Object.fromEntries(
    Object.entries(formData).filter(([key, val]) => {
      if (key === 'name_en' || key === 'name_ar') return false
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
    addToast(t('profile.updated') || 'Profile updated successfully', 'success')
  } else {
    if (!Object.keys(result.errors || {}).length) {
      addToast(result.error || t('profile.updateFailed') || 'Profile update failed', 'error')
    }
  }
}

async function handleUploadAvatar(file) {
  try {
    await profileStore.uploadAvatar(file)
    addToast('Profile image updated', 'success')
  } catch {
    addToast('Profile image upload failed', 'error')
  }
}

async function handleUploadCover(file) {
  try {
    await profileStore.uploadCover(file)
    addToast('Cover image updated', 'success')
  } catch {
    addToast('Cover image upload failed', 'error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16 space-y-8">
      <!-- Loading skeleton -->
      <div v-if="profileStore.loading" class="space-y-6">
        <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div class="h-40 sm:h-52 bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div class="px-6 sm:px-8 pb-6">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse border-4 border-white dark:border-slate-900 shadow-lg" />
              <div class="space-y-3 flex-1 pb-2">
                <div class="h-7 w-56 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div class="h-4 w-36 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div v-for="n in 5" :key="n" class="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div class="space-y-6">
            <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div v-for="n in 3" :key="n" class="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <AuthAlert
        v-else-if="profileStore.error && !profile"
        type="error"
        :message="profileStore.error"
      />

      <!-- Profile content -->
      <template v-else-if="profile">
        <!-- Error banner -->
        <div v-if="profileStore.error" class="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 flex items-start gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-semibold text-red-800 dark:text-red-200">{{ profileStore.error }}</p>
            <div v-if="Object.keys(profileStore.errors).length" class="mt-2 space-y-1">
              <p v-for="(msgs, field) in profileStore.errors" :key="field" class="text-xs text-red-600 dark:text-red-300">
                <span class="font-medium">{{ field }}:</span> {{ Array.isArray(msgs) ? msgs[0] : msgs }}
              </p>
            </div>
          </div>
          <button @click="profileStore.error = ''; profileStore.errors = {}" class="text-red-400 hover:text-red-600 transition">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Header Card -->
        <ProfileHeader
          :profile="profile"
          :initials="profileStore.initials"
          :loading="profileStore.loading"
          :avatar-uploading="profileStore.uploading.avatar"
          :cover-uploading="profileStore.uploading.cover"
          @upload-avatar="handleUploadAvatar"
          @upload-cover="handleUploadCover"
        />

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Form -->
          <div class="lg:col-span-2">
            <ProfileForm
              :profile="profile"
              :saving="profileStore.saving"
              :errors="profileStore.errors"
              @save="handleSave"
            />
          </div>

          <!-- Right: Sidebar -->
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

        <!-- 2FA Section -->
        <TwoFactorSetup />
      </template>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
          <svg class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Unable to load profile.</p>
        <AuthButton variant="secondary" class="mt-5" @click="profileStore.fetchProfile()">
          Try Again
        </AuthButton>
      </div>
    </main>

    <PublicToastContainer />
  </div>
</template>
