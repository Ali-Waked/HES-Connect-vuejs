import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { resolveTranslatedValue } from '../utils/locale';

export const useTagsStore = defineStore('tags', () => {
  const tags = ref([
    { id: 1, name: 'Emergency', count: 12, created_at: '2024-01-15T10:30:00Z' },
    { id: 2, name: 'Cardiology', count: 8, created_at: '2024-02-20T14:00:00Z' },
    { id: 3, name: 'Pediatrics', count: 15, created_at: '2024-03-10T09:15:00Z' },
    { id: 4, name: 'Public Health', count: 20, created_at: '2024-04-05T16:45:00Z' },
    { id: 5, name: 'Innovation', count: 5, created_at: '2024-05-12T11:20:00Z' },
    { id: 6, name: 'Research', count: 7, created_at: '2024-06-01T08:00:00Z' }
  ]);

  const stats = computed(() => ({
    totalTags: tags.value.length,
    mostUsed: [...tags.value].sort((a, b) => b.count - a.count).slice(0, 3)
  }));

  const addTag = (name) => {
    const existing = tags.value.find(t => resolveTranslatedValue(t.name).toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;

    const newId = tags.value.length > 0 ? Math.max(...tags.value.map(t => t.id)) + 1 : 1;
    tags.value.push({ id: newId, name, count: 0, created_at: new Date().toISOString() });
    return newId;
  };

  const updateTag = (id, name) => {
    const tag = tags.value.find(t => t.id === id);
    if (tag) tag.name = name;
  };

  const deleteTag = (id) => {
    tags.value = tags.value.filter(t => t.id !== id);
  };

  const incrementCount = (tagIds) => {
    tagIds.forEach(id => {
      const tag = tags.value.find(t => t.id === id);
      if (tag) tag.count++;
    });
  };

  return {
    tags,
    stats,
    addTag,
    updateTag,
    deleteTag,
    incrementCount
  };
});
