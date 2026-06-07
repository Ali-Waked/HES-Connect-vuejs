import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCommentsStore = defineStore('comments', () => {
  const comments = ref([
    { id: 1, user: 'Khalid Abu Amr', article: 'Managing Emergency Scenarios', content: 'Very informative article, thank you for sharing these techniques.', date: '2026-06-07T09:30:00Z', status: 'Approved' },
    { id: 2, user: 'Layla Ibrahim', article: 'Pediatric Care During Displacement', content: 'We need more resources like this in the field.', date: '2026-06-06T14:15:00Z', status: 'Pending' },
    { id: 3, user: 'Mohammed Al-Masri', article: 'Advanced Surgical Techniques', content: 'Can you provide more details on the sterilization process?', date: '2026-06-05T11:00:00Z', status: 'Flagged' }
  ]);

  const stats = computed(() => ({
    total: comments.value.length,
    pending: comments.value.filter(c => c.status === 'Pending').length,
    flagged: comments.value.filter(c => c.status === 'Flagged').length
  }));

  const updateStatus = (id, status) => {
    const comment = comments.value.find(c => c.id === id);
    if (comment) comment.status = status;
  };

  const deleteComment = (id) => {
    comments.value = comments.value.filter(c => c.id !== id);
  };

  return {
    comments,
    stats,
    updateStatus,
    deleteComment
  };
});
