import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTagsStore = defineStore('tags', () => {
  const tags = ref([
    { id: 1, name: 'Emergency', count: 12 },
    { id: 2, name: 'Cardiology', count: 8 },
    { id: 3, name: 'Pediatrics', count: 15 },
    { id: 4, name: 'Public Health', count: 20 },
    { id: 5, name: 'Innovation', count: 5 },
    { id: 6, name: 'Research', count: 7 }
  ]);

  const stats = computed(() => ({
    totalTags: tags.value.length,
    mostUsed: [...tags.value].sort((a, b) => b.count - a.count).slice(0, 3)
  }));

  const addTag = (name) => {
    const existing = tags.value.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;

    const newId = tags.value.length > 0 ? Math.max(...tags.value.map(t => t.id)) + 1 : 1;
    tags.value.push({ id: newId, name, count: 0 });
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
