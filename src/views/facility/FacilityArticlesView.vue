<script setup>
import { ref, computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'

const store = useStaffStore()
const { can } = useAuthPermissions()

const search = ref('')
const currentPage = ref(1)
const perPage = 9

const articles = computed(() => {
  let list = store.articles || store.news || []
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a => (a.title || '').toLowerCase().includes(q))
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(articles.value.length / perPage)))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return articles.value.slice(start, start + perPage)
})

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Articles</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ articles.length }} article(s)</p>
      </div>
      <button v-if="can('update_article')" class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New Article
      </button>
    </div>

    <div class="relative w-full sm:w-72">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
      <input v-model="search" type="text" placeholder="Search articles..." class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="a in paginated" :key="a.id" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-md transition">
        <div v-if="a.image" class="h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <img :src="a.image" :alt="a.title" class="w-full h-full object-cover" />
        </div>
        <div class="p-5">
          <p class="text-xs text-slate-400 dark:text-slate-500 mb-1">{{ a.category || 'General' }} · {{ a.date || a.publishedAt || '—' }}</p>
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{{ a.title }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">{{ a.summary || a.excerpt || a.content?.substring(0, 150) }}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <AvatarInitial :name="a.author || 'Staff'" />
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ a.author || 'Staff' }}</span>
            </div>
            <button class="text-xs font-bold text-brand-primary hover:underline">Read more</button>
          </div>
        </div>
      </div>
      <div v-if="paginated.length === 0" class="col-span-full text-center text-sm text-slate-400 dark:text-slate-500 py-10">No articles found.</div>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">Page {{ currentPage }} of {{ totalPages }}</p>
      <div class="flex gap-2">
        <button class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition" :disabled="currentPage === 1" @click="prevPage">Previous</button>
        <button class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
      </div>
    </div>
  </div>
</template>
