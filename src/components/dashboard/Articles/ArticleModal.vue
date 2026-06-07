<script setup>
import { ref, watch } from 'vue';
import { useDashboardStore } from '../../../stores/dashboard';

const props = defineProps({
  show: Boolean,
  article: Object,
  mode: { type: String, default: 'add' }
});

const emit = defineEmits(['close']);
const store = useDashboardStore();

const formData = ref({
  title: '',
  author: '',
  category: '',
  status: 'draft',
  content: ''
});

const categories = ['Medical', 'Pediatrics', 'Surgery', 'Health Policy', 'Obstetrics', 'General'];

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.mode === 'edit' && props.article) {
      formData.value = { ...props.article };
    } else {
      formData.value = {
        title: '',
        author: '',
        category: 'Medical',
        status: 'draft',
        content: ''
      };
    }
  }
});

const handleSubmit = () => {
  if (props.mode === 'edit') {
    store.updateArticle(props.article.id, formData.value);
  } else {
    store.addArticle(formData.value);
  }
  emit('close');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 class="text-lg font-bold text-slate-900">
          {{ mode === 'edit' ? 'Edit Article' : 'New Article' }}
        </h3>
        <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Title -->
          <div class="sm:col-span-2 space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
            <input 
              v-model="formData.title" 
              type="text" 
              required
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition"
              placeholder="Article title"
            />
          </div>

          <!-- Author -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Author</label>
            <input 
              v-model="formData.author" 
              type="text" 
              required
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition"
              placeholder="Author name"
            />
          </div>

          <!-- Category -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <select 
              v-model="formData.category" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary transition cursor-pointer"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select 
              v-model="formData.status" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary transition cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Content</label>
          <textarea 
            v-model="formData.content" 
            required
            rows="6"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition resize-none"
            placeholder="Write your article content here..."
          ></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-primary/20 transition cursor-pointer"
          >
            {{ mode === 'edit' ? 'Update Article' : 'Create Article' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-in {
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
