import { ref } from 'vue';

const toasts = ref([]);
let nextId = 0;

export function usePublicToast() {
  function addToast(message, type = 'success') {
    const id = ++nextId;
    toasts.value.push({ id, message, type });
    setTimeout(() => removeToast(id), 4000);
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  return { toasts, addToast, removeToast };
}
