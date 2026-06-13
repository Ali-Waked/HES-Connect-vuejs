<script setup>
import { reactive, ref, watch } from 'vue';
import { useProfile } from '../../composables/useProfile';

const props = defineProps({
  profile: { type: Object, required: true },
  saving: { type: Boolean, default: false }
});

const emit = defineEmits(['save']);
const { validateProfile } = useProfile(ref(props.profile));
const editMode = ref(false);
const errors = ref({});

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  gender: 'male',
  birthDate: '',
  address: ''
});

function syncForm() {
  form.fullName = props.profile.fullName || '';
  form.email = props.profile.email || '';
  form.phone = props.profile.phone || '';
  form.gender = props.profile.gender || 'male';
  form.birthDate = props.profile.birthDate || '';
  form.address = props.profile.address || '';
}

watch(() => props.profile, syncForm, { immediate: true, deep: true });

async function save() {
  errors.value = validateProfile(form);
  if (Object.keys(errors.value).length) return;

  emit('save', { ...form });
  editMode.value = false;
}

function cancel() {
  syncForm();
  errors.value = {};
  editMode.value = false;
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Personal Information</h2>
        <p class="mt-1 text-sm text-slate-500">Manage contact details from the user profile record.</p>
      </div>
      <button
        v-if="!editMode"
        type="button"
        class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        @click="editMode = true"
      >
        <span class="material-symbols-outlined text-[18px]">edit</span>
        Edit
      </button>
    </div>

    <form class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2" @submit.prevent="save">
      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</span>
        <input v-model="form.fullName" :disabled="!editMode" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 " />
        <span v-if="errors.fullName" class="text-xs font-semibold text-rose-600">{{ errors.fullName }}</span>
      </label>

      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
        <input v-model="form.email" type="email" :disabled="!editMode" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 " />
        <span v-if="errors.email" class="text-xs font-semibold text-rose-600">{{ errors.email }}</span>
      </label>

      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</span>
        <input v-model="form.phone" :disabled="!editMode" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 " />
        <span v-if="errors.phone" class="text-xs font-semibold text-rose-600">{{ errors.phone }}</span>
      </label>

      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</span>
        <select v-model="form.gender" :disabled="!editMode" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition disabled:bg-slate-50 disabled:text-slate-600 ">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </label>

      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Birth Date</span>
        <input v-model="form.birthDate" type="date" :disabled="!editMode" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 " />
      </label>

      <label class="space-y-2 sm:col-span-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</span>
        <textarea v-model="form.address" rows="3" :disabled="!editMode" class="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none transition disabled:bg-slate-50 disabled:text-slate-600 "></textarea>
      </label>

      <div v-if="editMode" class="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
        <button type="button" class="h-10 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" @click="cancel">Cancel</button>
        <button type="submit" :disabled="saving" class="h-10 rounded-lg bg-brand-primary px-6 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:opacity-60">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </section>
</template>
