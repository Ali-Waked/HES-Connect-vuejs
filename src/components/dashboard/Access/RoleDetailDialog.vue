<script setup>
import { computed } from 'vue';
import BaseDialog from '../global/BaseDialog.vue';
import BaseBadge from '../global/BaseBadge.vue';
import { useAccessStore } from '../../../stores/access';

const props = defineProps({
  show: { type: Boolean, required: true },
  role: { type: Object, default: null }
});

const store = useAccessStore();

const rolePermissions = computed(() => {
  if (!props.role) return [];
  return props.role.permissions.map(id => store.permissions.find(p => p.id === id)).filter(Boolean);
});

const groupPermissions = (perms) => {
  return perms.reduce((acc, p) => {
    const group = p.name.split(':')[0] || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});
};

const groupedPermissions = computed(() => groupPermissions(rolePermissions.value));
</script>

<template>
  <BaseDialog 
    :show="show" 
    title="Role Details" 
    size="md"
    @close="$emit('close')"
  >
    <div v-if="role" class="space-y-6">
      <div class="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h4 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ role.name }}</h4>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">System Role Definition</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-black text-brand-primary">{{ role.user_count }}</div>
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Users</p>
        </div>
      </div>

      <div class="space-y-4">
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Permissions ({{ role.permissions.length }})</label>
        
        <div class="space-y-4">
          <div v-for="(perms, group) in groupedPermissions" :key="group" class="space-y-2">
            <h5 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ group }}</h5>
            <div class="flex flex-wrap gap-2">
              <BaseBadge 
                v-for="perm in perms" 
                :key="perm.id"
                variant="primary"
              >
                {{ perm.name }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          @click="$emit('close')"
          class="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold rounded-xl transition"
        >
          Close View
        </button>
      </div>
    </div>
  </BaseDialog>
</template>
