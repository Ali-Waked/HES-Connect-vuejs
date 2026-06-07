import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAccessStore = defineStore('access', () => {
  const roles = ref([
    { id: 1, name: 'Super Admin', permissions: [1, 2, 3, 4, 5, 6, 7, 8], user_count: 2 },
    { id: 2, name: 'Facility Manager', permissions: [1, 2, 5, 6], user_count: 5 },
    { id: 3, name: 'Doctor', permissions: [5, 7], user_count: 12 },
    { id: 4, name: 'Patient', permissions: [8], user_count: 45 }
  ]);

  const permissions = ref([
    { id: 1, name: 'users:view', description: 'Can view user list' },
    { id: 2, name: 'users:manage', description: 'Can create, edit and delete users' },
    { id: 3, name: 'roles:view', description: 'Can view roles' },
    { id: 4, name: 'roles:manage', description: 'Can manage system roles' },
    { id: 5, name: 'facilities:view', description: 'Can view facilities' },
    { id: 6, name: 'facilities:manage', description: 'Can edit facility data' },
    { id: 7, name: 'appointments:manage', description: 'Can manage medical appointments' },
    { id: 8, name: 'records:view', description: 'Can view personal health records' }
  ]);

  const stats = computed(() => ({
    totalRoles: roles.value.length,
    totalPermissions: permissions.value.length,
    totalAssignedUsers: roles.value.reduce((acc, curr) => acc + curr.user_count, 0)
  }));

  // Roles CRUD
  const addRole = (role) => {
    const newId = roles.value.length > 0 ? Math.max(...roles.value.map(r => r.id)) + 1 : 1;
    roles.value.push({ ...role, id: newId, user_count: 0 });
  };

  const updateRole = (id, updatedRole) => {
    const index = roles.value.findIndex(r => r.id === id);
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...updatedRole };
    }
  };

  const deleteRole = (id) => {
    roles.value = roles.value.filter(r => r.id !== id);
  };

  // Permissions CRUD
  const addPermission = (permission) => {
    const newId = permissions.value.length > 0 ? Math.max(...permissions.value.map(p => p.id)) + 1 : 1;
    permissions.value.push({ ...permission, id: newId });
  };

  const updatePermission = (id, updatedPerm) => {
    const index = permissions.value.findIndex(p => p.id === id);
    if (index !== -1) {
      permissions.value[index] = { ...permissions.value[index], ...updatedPerm };
    }
  };

  const deletePermission = (id) => {
    permissions.value = permissions.value.filter(p => p.id !== id);
  };

  return {
    roles,
    permissions,
    stats,
    addRole,
    updateRole,
    deleteRole,
    addPermission,
    updatePermission,
    deletePermission
  };
});
