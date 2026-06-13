<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useOrganizationUsers } from '../../../composables/useOrganizationUsers';
import { getUsers } from '../../../services/organizationUserService';
import { getOrganizations } from '../../../services/organizationService';

const props = defineProps({
  show: { type: Boolean, required: true },
  assignment: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { createOrganizationUser, updateOrganizationUser, fetchOrganizationUser, saving } = useOrganizationUsers();

const users = ref([]);
const organizations = ref([]);
const userId = ref('');
const organizationId = ref('');
const role = ref('');
const loadingDropdowns = ref(false);
const loadingAssignment = ref(false);

const roleOptions = ['owner', 'manager', 'editor', 'viewer']

async function loadDropdowns() {
  loadingDropdowns.value = true
  try {
    const [usersRes, orgsRes] = await Promise.all([
      getUsers({ per_page: 1000 }),
      getOrganizations({ per_page: 1000 }),
    ])
    users.value = usersRes.data.data || usersRes.data
    organizations.value = orgsRes.data.data || orgsRes.data
  } catch (err) {
    users.value = []
    organizations.value = []
  } finally {
    loadingDropdowns.value = false
  }
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      loadDropdowns()
    }
  },
  { immediate: false }
)

watch(
  () => props.assignment,
  async (newAssignment) => {
    if (newAssignment && newAssignment.id) {
      loadingAssignment.value = true
      try {
        const data = await fetchOrganizationUser(newAssignment.id)
        userId.value = data.user?.uuid || data.user?.id || ''
        organizationId.value = data.organization?.uuid || data.organization?.id || ''
        role.value = data.role || ''
      } catch (err) {
        userId.value = ''
        organizationId.value = ''
        role.value = ''
      } finally {
        loadingAssignment.value = false
      }
    } else {
      userId.value = ''
      organizationId.value = ''
      role.value = ''
    }
  },
  { immediate: true }
)

const submitForm = async () => {
  const data = {
    user_id: userId.value,
    organization_id: organizationId.value,
    role: role.value,
  }

  let result
  if (props.assignment && props.assignment.id) {
    console.log(props.assignment.id, data);
    result = await updateOrganizationUser(props.assignment.id, data)
  } else {
    result = await createOrganizationUser(data)
  }

  if (result.success) {
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[520px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ assignment ? $t('common.edit') + ' ' + $t('organizationUsers.assignment') : $t('common.add') + ' ' + $t('organizationUsers.assignment') }}
        </h3>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="flex flex-col flex-1 overflow-hidden">
        <div v-if="loadingAssignment" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="ouUser">{{ $t('organizationUsers.user') }} *</label>
            <select
              id="ouUser"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition cursor-pointer"
              required
              :disabled="!!assignment"
              v-model="userId"
            >
              <option value="" disabled>{{ $t('organizationUsers.selectUser') }}</option>
              <option
                v-for="user in users"
                :key="user.uuid || user.id"
                :value="user.uuid || user.id"
              >
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="ouOrg">{{ $t('organizationUsers.organization') }} *</label>
            <select
              id="ouOrg"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition cursor-pointer"
              required
              v-model="organizationId"
            >
              <option value="" disabled>{{ $t('organizationUsers.selectOrganization') }}</option>
              <option
                v-for="org in organizations"
                :key="org.uuid || org.id"
                :value="org.uuid || org.id"
              >
                {{ localField(org, 'name') }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="ouRole">{{ $t('organizationUsers.role') }} *</label>
            <select
              id="ouRole"
              class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition cursor-pointer"
              required
              v-model="role"
            >
              <option value="" disabled>{{ $t('organizationUsers.selectRole') }}</option>
              <option
                v-for="r in roleOptions"
                :key="r"
                :value="r"
              >
                {{ $t(`organizationRoles.${r}`) }}
              </option>
            </select>
          </div>
        </div>

        <div v-show="!loadingAssignment" class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            @click="$emit('close')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {{ assignment ? $t('common.save') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
