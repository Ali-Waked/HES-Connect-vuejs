<script setup>
import { computed, onMounted, ref } from 'vue';
import AppNavbar from '../components/global/AppNavbar.vue';
import ToastContainer from '../components/dashboard/global/ToastContainer.vue';
import ProfileHeader from '../components/profile/ProfileHeader.vue';
import ProfileTabs from '../components/profile/ProfileTabs.vue';
import ProfileForm from '../components/profile/ProfileForm.vue';
import SecurityForm from '../components/profile/SecurityForm.vue';
import ActivityTimeline from '../components/profile/ActivityTimeline.vue';
import { useDashboardStore } from '../stores/dashboard';
import { useProfileStore } from '../stores/profile';
import { useAuthStore } from '../stores/auth';
import { useProfile } from '../composables/useProfile';

const profileStore = useProfileStore();
const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const activeTab = ref('overview');
const { formatDateTime } = useProfile(computed(() => profileStore.profile));

const summaryCards = computed(() => [
  {
    label: 'Account Status',
    value: profileStore.profile.status,
    icon: 'verified',
    accent: 'text-emerald-700 bg-emerald-50 ring-emerald-100'
  },
  {
    label: 'Role',
    value: profileStore.profile.role,
    icon: 'admin_panel_settings',
    accent: 'text-blue-700 bg-blue-50 ring-blue-100'
  },
  {
    label: 'Last Login',
    value: formatDateTime(profileStore.profile.lastLogin),
    icon: 'login',
    accent: 'text-amber-700 bg-amber-50 ring-amber-100'
  },
  {
    label: 'Total Actions Performed',
    value: Number(profileStore.profile.totalActions || 0).toLocaleString(),
    icon: 'analytics',
    accent: 'text-slate-700 bg-slate-50 ring-slate-100'
  }
]);

onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfile(),
    profileStore.fetchActivity()
  ]);
});

async function saveProfile(data) {
  try {
    await profileStore.updateProfile(data);
    authStore.updateProfile({ name: data.fullName });
    dashboardStore.addToast('Profile updated successfully', 'success');
  } catch {
    dashboardStore.addToast('Profile update failed', 'error');
  }
}

async function savePassword(payload) {
  try {
    await profileStore.updatePassword(payload);
    dashboardStore.addToast('Password updated successfully', 'success');
  } catch {
    dashboardStore.addToast('Password update failed', 'error');
  }
}

async function uploadAvatar(file) {
  try {
    await profileStore.uploadAvatar(file);
    dashboardStore.addToast('Profile image updated', 'success');
  } catch {
    dashboardStore.addToast('Profile image upload failed', 'error');
  }
}

async function uploadCover(file) {
  try {
    await profileStore.uploadCover(file);
    dashboardStore.addToast('Cover image updated', 'success');
  } catch {
    dashboardStore.addToast('Cover image upload failed', 'error');
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 antialiased">
    <AppNavbar variant="dashboard" />

    <main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="mb-5">
        <p class="text-sm font-semibold text-brand-primary">My Profile</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Super Admin Profile</h1>
      </div>

      <ProfileHeader
        :profile="profileStore.profile"
        :initials="profileStore.initials"
        :loading="profileStore.loading"
        :avatar-uploading="profileStore.uploading.avatar"
        :cover-uploading="profileStore.uploading.cover"
        @upload-avatar="uploadAvatar"
        @upload-cover="uploadCover"
      />

      <section class="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 shadow-sm sm:px-6">
        <ProfileTabs v-model="activeTab" />
      </section>

      <Transition name="profile-tab" mode="out-in">
        <section :key="activeTab" class="mt-6">
          <div v-if="activeTab === 'overview'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="card in summaryCards"
              :key="card.label"
              class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
            >
              <div class="flex items-center justify-between gap-4">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl ring-1" :class="card.accent">
                  <span class="material-symbols-outlined text-[20px]">{{ card.icon }}</span>
                </span>
              </div>
              <p class="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">{{ card.label }}</p>
              <p class="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-100">{{ card.value }}</p>
            </article>
          </div>

          <ProfileForm
            v-else-if="activeTab === 'personal'"
            :profile="profileStore.profile"
            :saving="profileStore.saving"
            @save="saveProfile"
          />

          <SecurityForm
            v-else-if="activeTab === 'security'"
            :saving="profileStore.saving"
            @save-password="savePassword"
          />

          <ActivityTimeline
            v-else
            :items="profileStore.activity"
            :loading="profileStore.activityLoading"
            :has-more="profileStore.activityHasMore"
            :error="profileStore.activityError"
            @load-more="profileStore.loadMoreActivity"
          />
        </section>
      </Transition>
    </main>

    <ToastContainer />
  </div>
</template>

<style scoped>
.profile-tab-enter-active,
.profile-tab-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.profile-tab-enter-from,
.profile-tab-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
