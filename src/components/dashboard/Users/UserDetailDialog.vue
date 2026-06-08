<script setup>
import { computed } from 'vue';
import BaseDialog from '../global/BaseDialog.vue';
import BaseBadge from '../global/BaseBadge.vue';
import { useAccessStore } from '../../../stores/access';
import { useDashboardStore } from '../../../stores/dashboard';

const props = defineProps({
  show: { type: Boolean, required: true },
  user: { type: Object, default: null },
  type: { type: String, required: true } // 'staff' or 'patient'
});

const emit = defineEmits(['close']);

const accessStore = useAccessStore();
const dashboardStore = useDashboardStore();

const userRole = computed(() => {
  if (!props.user) return null;
  return accessStore.roles.find(r => r.id === props.user.role_id);
});

const userPermissions = computed(() => {
  if (!userRole.value) return [];
  return userRole.value.permissions.map(id => accessStore.permissions.find(p => p.id === id)).filter(Boolean);
});

const groupPermissions = (perms) => {
  return perms.reduce((acc, p) => {
    const group = p.name.split(':')[0] || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});
};

const groupedPermissions = computed(() => groupPermissions(userPermissions.value));

const handleRoleChange = (e) => {
  const roleId = parseInt(e.target.value);
  if (props.user && roleId) {
    dashboardStore.updateUserRole(props.user.id, props.type, roleId);
  }
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    title="User Profile & Access" 
    size="lg"
    @close="$emit('close')"
  >
    <div v-if="user" class="space-y-8">
      <!-- Profile & Cover Section -->
      <div class="relative">
        <div class="h-32 w-full bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl overflow-hidden">
          <img v-if="user.profile?.coverImage" :src="user.profile.coverImage" class="w-full h-full object-cover opacity-50" />
        </div>
        <div class="absolute -bottom-6 left-6 flex items-end gap-4">
          <div class="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl">
            <div class="w-full h-full rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-3xl border-4 border-white">
              {{ user.name.charAt(0) }}
            </div>
          </div>
          <div class="mb-2 pb-1">
            <h4 class="text-xl font-black text-slate-900 dark:text-slate-100 leading-none">{{ user.name }}</h4>
            <p class="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">{{ type }} â€¢ Joined {{ user.joined || 'Recently' }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <!-- Info Column -->
        <div class="lg:col-span-2 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</label>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ user.email }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</label>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ user.profile?.phone || 'Not provided' }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gender</label>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ user.profile?.gender || 'Not specified' }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Birth Date</label>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ user.profile?.birthDate || 'Not provided' }}</p>
            </div>
            <div class="md:col-span-2 space-y-1">
              <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Home Address</label>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ user.profile?.address || 'No address on file' }}</p>
            </div>
          </div>

          <!-- Permissions Section -->
          <div class="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
            <label class="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Inherited Permissions</label>
            <div v-if="userRole" class="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(perms, group) in groupedPermissions" :key="group" class="space-y-2">
                <h5 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ group }}</h5>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="perm in perms" 
                    :key="perm.id"
                    class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase tracking-tighter"
                  >
                    {{ perm.name.split(':')[1] || perm.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Role & Management Column -->
        <div class="space-y-6">
          <div class="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-6">
            <div class="space-y-3">
              <label class="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Access Role</label>
              <select 
                :value="user.role_id"
                @change="handleRoleChange"
                class="w-full p-3 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none transition cursor-pointer bg-white dark:bg-slate-800 shadow-sm"
              >
                <option v-for="role in accessStore.roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>

            <div class="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button class="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">Reset Password</button>
              <button class="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 hover:border-rose-100 transition">Suspend User</button>
            </div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <span class="text-xs text-slate-400 dark:text-slate-500 font-medium italic">Last updated: Today, 10:20 AM</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
        <button 
          @click="$emit('close')"
          class="px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition shadow-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
