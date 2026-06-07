import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([
    { id: 1, name: 'John Doe', email: 'john@example.com', message: 'Hello, I would like to know more about your services.', status: 'new', created_at: '2026-06-01T10:00:00Z' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'I have an issue with my appointment booking. Can you help?', status: 'read', created_at: '2026-06-02T11:30:00Z' },
    { id: 3, name: 'Robert Brown', email: 'robert@example.com', message: 'Thank you for the great service!', status: 'replied', created_at: '2026-06-03T09:15:00Z' },
    { id: 4, name: 'Alice Wilson', email: 'alice@example.com', message: 'Is there any vacancy for a nurse?', status: 'new', created_at: '2026-06-05T14:45:00Z' }
  ]);

  const stats = computed(() => {
    return {
      total: messages.value.length,
      new: messages.value.filter(m => m.status === 'new').length,
      read: messages.value.filter(m => m.status === 'read').length,
      replied: messages.value.filter(m => m.status === 'replied').length
    };
  });

  const markAsRead = (id) => {
    const message = messages.value.find(m => m.id === id);
    if (message && message.status === 'new') {
      message.status = 'read';
    }
  };

  const markAsReplied = (id) => {
    const message = messages.value.find(m => m.id === id);
    if (message) {
      message.status = 'replied';
    }
  };

  const deleteMessage = (id) => {
    messages.value = messages.value.filter(m => m.id !== id);
  };

  return {
    messages,
    stats,
    markAsRead,
    markAsReplied,
    deleteMessage
  };
});
