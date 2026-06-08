<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';
import ConfirmModal from '../global/ConfirmModal.vue';
import UserDetailDialog from '../../../components/dashboard/Users/UserDetailDialog.vue';

const store = useDashboardStore();
const router = useRouter();

const searchQuery = ref('');
const showDeleteModal = ref(false);
const showDetailModal = ref(false);
const selectedMember = ref(null);

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500'];
const avatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
const initial = (name) => name ? name.replace('Dr. ', '').charAt(0).toUpperCase() : '?';

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return store.staff;
  return store.staff.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    s.specialization.toLowerCase().includes(q)
  );
});

const openAddModal = () => {
  selectedMember.value = null;
  showDetailModal.value = true;
};

const openEditModal = (member) => {
  selectedMember.value = member;
  showDetailModal.value = true;
};

const confirmDel = (member) => {
  selectedMember.value = member;
  showDeleteModal.value = true;
};

const handleDelete = () => {
  if (selectedMember.value) {
    store.deleteStaff(selectedMember.value.id);
    showDeleteModal.value = false;
    selectedMember.value = null;
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="flex items-start gap-3">
        <button
          class="mt-1 p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          title="Back to Users"
          @click="router.push('/admin/users')"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Staff Management</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ filtered.length }} registered staff {{ filtered.length === 1 ? 'member' : 'members' }}
          </p>
        </div>
      </div>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAddModal"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Add Staff
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search staff..."
        class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
      />
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Staff Member</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specialization</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experience</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fee</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Provider</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Seen</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="member in filtered" :key="member.id" class="hover:bg-slate-50/50 transition-colors">

              <!-- Name & Email -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div :class="`w-9 h-9 rounded-full ${avatarColor(member.name)} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`">
                    {{ initial(member.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ member.name }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500">{{ member.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Specialization -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{{ member.specialization }}</td>

              <!-- Experience -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <svg class="w-3.5 h-3.5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clip-rule="evenodd"/>
                  </svg>
                  {{ member.experience }} yrs
                </span>
              </td>

              <!-- Fee -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">${{ member.fee }}</td>

              <!-- Provider -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="member.provider === 'Google' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'"
                >
                  {{ member.provider }}
                </span>
              </td>

              <!-- Last Seen -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{ member.lastSeen }}</td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 text-sm font-semibold"
                  :class="member.status === 'Online' ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'"
                >
                  <svg v-if="member.status === 'Online'" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M9.879 9.879a3 3 0 104.243 4.243M7.05 7.05C5.68 8.42 4.75 10.24 4.5 12c1.274 4.057 5.064 7 9.542 7 1.55 0 3.02-.36 4.325-1.002M12 18.75c-2.676 0-5.216-.584-7.499-1.632"/>
                  </svg>
                  {{ member.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex justify-end gap-1.5">
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                    title="Edit"
                    @click="openEditModal(member)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button
                    class="text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                    title="Delete"
                    @click="confirmDel(member)"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Staff Member"
      :message="`Are you sure you want to delete <strong>${selectedMember?.name}</strong>?`"
      confirm-text="Delete"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />

    <!-- User Detail Dialog -->
    <UserDetailDialog
      :show="showDetailModal"
      :user="selectedMember"
      type="staff"
      @close="showDetailModal = false"
    />

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>