<script setup>
import { ref, computed } from 'vue';
import { usePermissionHelper } from '../../../composables/usePermissionHelper';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  permissions: { type: Array, required: true },
  label: { type: String, default: 'Assign Permissions' }
});

const emit = defineEmits(['update:modelValue']);

const { getPermissionName, getPermissionDescription } = usePermissionHelper();

const searchQuery = ref('');

const filteredPermissions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return props.permissions.filter(p => {
    const nameEn = (p.name?.en || '').toLowerCase();
    const nameAr = (p.name?.ar || '').toLowerCase();
    const key = (p.key || '').toLowerCase();
    return key.includes(query) || nameEn.includes(query) || nameAr.includes(query);
  });
});

const togglePermission = (uuid) => {
  const current = [...props.modelValue];
  const index = current.indexOf(uuid);
  if (index === -1) {
    current.push(uuid);
  } else {
    current.splice(index, 1);
  }
  emit('update:modelValue', current);
};

const isSelected = (uuid) => props.modelValue.includes(uuid);

const groupPermissions = (perms) => {
  return perms.reduce((acc, p) => {
    const group = (p.key || '').split('.')[0] || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});
};

const groupedPermissions = computed(() => groupPermissions(filteredPermissions.value));

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function titleCase(str) {
  return str.split('_').map(capitalize).join(' ')
}
</script>

<template>
  <div class="space-y-3">
    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">{{ label }}</label>

    <div class="relative">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Filter permissions..."
        class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none transition"
      />
    </div>
    <div class="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-slate-50/50 p-4 space-y-4 custom-scrollbar">
      <div v-for="(perms, group) in groupedPermissions" :key="group" class="space-y-2">
        <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">{{ titleCase(group) }}</h5>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="perm in perms"
            :key="perm.uuid"
            class="flex items-center gap-3 p-2.5 rounded-lg border transition cursor-pointer select-none"
            :class="isSelected(perm.uuid) ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'"
            :title="getPermissionDescription(perm)"
          >
            <input
              type="checkbox"
              class="hidden"
              :checked="isSelected(perm.uuid)"
              @change="togglePermission(perm.uuid)"
            />
            <span class="material-symbols-outlined text-lg">
              {{ isSelected(perm.uuid) ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold truncate">{{ getPermissionName(perm) }}</span>
              <span v-if="getPermissionDescription(perm)" class="text-[10px] text-slate-400 truncate">{{ getPermissionDescription(perm) }}</span>
            </div>
          </label>
        </div>
      </div>
      <div v-if="Object.keys(groupedPermissions).length === 0" class="py-8 text-center text-slate-400 text-xs font-medium">
        No permissions found matching your search.
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
