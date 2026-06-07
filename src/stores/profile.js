import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const fallbackProfile = {
  fullName: 'Super Admin',
  email: 'admin@health.ps',
  phone: '+970 59-123-4567',
  gender: 'male',
  birthDate: '1985-05-15',
  address: 'Remal District, Gaza City, Palestine',
  role: 'Super Admin',
  status: 'Active',
  lastLogin: '2026-06-07T10:20:00Z',
  avatarUrl: null,
  coverUrl: null,
  totalActions: 1240
};

const fallbackActivity = [
  { id: 1, title: 'Updated user role', description: 'USR-998 was assigned a new access role.', occurredAt: '2026-06-07T10:20:00Z', type: 'system' },
  { id: 2, title: 'Approved medication request', description: 'Medication request REQ-4412 was approved.', occurredAt: '2026-06-07T09:45:00Z', type: 'clinical' },
  { id: 3, title: 'Changed system settings', description: 'Authentication service settings were updated.', occurredAt: '2026-06-07T08:15:00Z', type: 'security' },
  { id: 4, title: 'Account login', description: 'Successful login from 192.168.1.1.', occurredAt: '2026-06-07T08:00:00Z', type: 'login' }
];

function normalizeProfile(data = {}) {
  const profile = data.profile || data.user || data;

  return {
    ...fallbackProfile,
    ...profile,
    fullName: profile.fullName || profile.name || fallbackProfile.fullName,
    avatarUrl: profile.avatarUrl || profile.avatar || profile.profile_image || null,
    coverUrl: profile.coverUrl || profile.coverImage || profile.cover_image || null,
    birthDate: profile.birthDate || profile.birth_date || fallbackProfile.birthDate,
    totalActions: profile.totalActions ?? profile.total_actions ?? fallbackProfile.totalActions
  };
}

function normalizeActivity(data = {}) {
  const rows = Array.isArray(data) ? data : data.data || data.activity || [];

  return rows.map((item, index) => ({
    id: item.id || `${item.type || 'activity'}-${index}`,
    title: item.title || item.action || item.event || 'System activity',
    description: item.description || item.target || item.message || 'Profile activity recorded.',
    occurredAt: item.occurredAt || item.created_at || item.date || item.timestamp || new Date().toISOString(),
    type: item.type || item.category || 'system'
  }));
}

async function request(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const useProfileStore = defineStore('profile', () => {
  const profile = ref({ ...fallbackProfile });
  const activity = ref([]);
  const loading = ref(false);
  const activityLoading = ref(false);
  const saving = ref(false);
  const uploading = ref({ avatar: false, cover: false });
  const error = ref('');
  const activityError = ref('');
  const activityPage = ref(1);
  const activityHasMore = ref(true);

  const initials = computed(() => {
    return profile.value.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'SA';
  });

  async function fetchProfile() {
    loading.value = true;
    error.value = '';

    try {
      const data = await request('/api/profile');
      profile.value = normalizeProfile(data);
    } catch (err) {
      error.value = 'Profile API is unavailable. Showing local profile data.';
      profile.value = normalizeProfile(profile.value);
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(data) {
    saving.value = true;
    error.value = '';
    const previous = { ...profile.value };
    profile.value = { ...profile.value, ...data };

    try {
      const response = await request('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      profile.value = normalizeProfile(response || profile.value);
      return profile.value;
    } catch (err) {
      profile.value = previous;
      error.value = err.message || 'Could not update profile.';
      throw err;
    } finally {
      saving.value = false;
    }
  }

  async function updatePassword(payload) {
    saving.value = true;
    error.value = '';

    try {
      await request('/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } finally {
      saving.value = false;
    }
  }

  async function uploadImage(kind, file) {
    const endpoint = kind === 'cover' ? '/api/profile/cover' : '/api/profile/avatar';
    const field = kind === 'cover' ? 'cover' : 'avatar';
    const urlKey = kind === 'cover' ? 'coverUrl' : 'avatarUrl';
    const localPreview = URL.createObjectURL(file);
    const previous = profile.value[urlKey];

    uploading.value[kind] = true;
    profile.value[urlKey] = localPreview;

    try {
      const formData = new FormData();
      formData.append(field, file);
      const response = await request(endpoint, {
        method: 'POST',
        body: formData
      });
      const nextUrl = response?.url || response?.[urlKey] || response?.[field] || localPreview;
      profile.value[urlKey] = nextUrl;
      return nextUrl;
    } catch (err) {
      if (err.status === 404) {
        profile.value[urlKey] = localPreview;
        return localPreview;
      }
      profile.value[urlKey] = previous;
      throw err;
    } finally {
      uploading.value[kind] = false;
    }
  }

  function uploadAvatar(file) {
    return uploadImage('avatar', file);
  }

  function uploadCover(file) {
    return uploadImage('cover', file);
  }

  async function fetchActivity({ page = 1, append = false } = {}) {
    activityLoading.value = true;
    activityError.value = '';

    try {
      const data = await request(`/api/profile/activity?page=${page}`);
      const rows = normalizeActivity(data);
      activity.value = append ? [...activity.value, ...rows] : rows;
      activityHasMore.value = rows.length > 0 && Boolean(data?.next_page_url ?? data?.hasMore ?? rows.length >= 10);
      activityPage.value = page;
    } catch (err) {
      activityError.value = 'Activity API is unavailable. Showing sample activity.';
      activity.value = append ? activity.value : fallbackActivity;
      activityHasMore.value = false;
    } finally {
      activityLoading.value = false;
    }
  }

  async function loadMoreActivity() {
    if (!activityHasMore.value || activityLoading.value) return;
    await fetchActivity({ page: activityPage.value + 1, append: true });
  }

  return {
    profile,
    activity,
    loading,
    activityLoading,
    saving,
    uploading,
    error,
    activityError,
    activityHasMore,
    initials,
    fetchProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
    uploadCover,
    fetchActivity,
    loadMoreActivity
  };
});
