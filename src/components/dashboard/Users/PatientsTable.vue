<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';
import ConfirmModal from '../global/ConfirmModal.vue';

const store = useDashboardStore();
const router = useRouter();

const searchQuery = ref('');
const showDeleteModal = ref(false);
const selectedPatient = ref(null);

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500'];
const avatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
const initial = (name) => name ? name.charAt(0).toUpperCase() : '?';

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return store.patients;
  return store.patients.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.email.toLowerCase().includes(q)
  );
});

const confirmDel = (patient) => { selectedPatient.value = patient; showDeleteModal.value = true; };
const handleDelete = () => {
  if (selectedPatient.value) {
    store.deletePatient(selectedPatient.value.id);
    showDeleteModal.value = false;
    selectedPatient.value = null;
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="flex items-start gap-3">
        <button
          class="mt-1 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          title="Back to Users"
          @click="router.push('/admin/users')"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Patient Records</h1>
          <p class="text-sm text-slate-500 mt-1">{{ filtered.length }} registered {{ filtered.length === 1 ? 'patient' : 'patients' }}</p>
        </div>
      </div>
      <button class="inline-flex items-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Add Patient
      </button>
    </div>

    <div class="relative">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search patients..."
        class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 transition"
      />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Provider</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Seen</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">History</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="patient in filtered" :key="patient.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div :class="`w-9 h-9 rounded-full ${avatarColor(patient.name)} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`">
                    {{ initial(patient.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ patient.name }}</p>
                    <p class="text-xs text-slate-400">{{ patient.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="patient.provider === 'Google' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
                >{{ patient.provider }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ patient.lastSeen }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ patient.joined }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 text-sm font-semibold"
                  :class="patient.status === 'Online' ? 'text-emerald-600' : 'text-slate-400'"
                >
                  <svg v-if="patient.status === 'Online'" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M9.879 9.879a3 3 0 104.243 4.243M7.05 7.05C5.68 8.42 4.75 10.24 4.5 12c1.274 4.057 5.064 7 9.542 7 1.55 0 3.02-.36 4.325-1.002M12 18.75c-2.676 0-5.216-.584-7.499-1.632"/>
                  </svg>
                  {{ patient.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition cursor-pointer">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                  </svg>
                  View
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex justify-end gap-1.5">
                  <button class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer" title="Edit">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer" title="Delete" @click="confirmDel(patient)">
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

    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Patient"
      :message="`Are you sure you want to delete <strong>${selectedPatient?.name}</strong>?`"
      confirm-text="Delete"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
