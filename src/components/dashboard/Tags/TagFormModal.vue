<script setup>
import { ref, watch } from 'vue';
import BaseDialog from '../global/BaseDialog.vue';
import { useTagsStore } from '../../../stores/tags';

const props = defineProps({
  show: { type: Boolean, required: true },
  tag: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const store = useTagsStore();

const tagName = ref('');
const error = ref('');

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    tagName.value = props.tag ? props.tag.name : '';
    error.value = '';
  }
});

const handleSubmit = () => {
  if (!tagName.value.trim()) {
    error.value = 'Tag name is required';
    return;
  }

  if (props.tag) {
    store.updateTag(props.tag.id, tagName.value.trim());
  } else {
    store.addTag(tagName.value.trim());
  }
  emit('close');
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    :title="tag ? 'Edit Tag' : 'Create Tag'" 
    size="sm"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tag Name</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">#</span>
          <input 
            v-model="tagName"
            type="text"
            class="w-full pl-7 pr-4 py-3 text-sm border rounded-xl focus:outline-none transition"
            :class="error ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'"
            placeholder="emergency"
          />
        </div>
        <p v-if="error" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ error }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button 
          type="button"
          @click="$emit('close')"
          class="py-2.5 px-6 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-lg transition"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="py-2.5 px-8 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition"
        >
          {{ tag ? 'Save Changes' : 'Create Tag' }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
