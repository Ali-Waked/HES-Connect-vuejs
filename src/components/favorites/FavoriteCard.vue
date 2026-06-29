<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import FavoriteButton from './FavoriteButton.vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const router = useRouter()
const { t, locale } = useI18n()

const entity = computed(() => props.item.entity || props.item)
const type = computed(() => props.item.type)

const title = computed(() => {
  const e = entity.value
  if (!e) return ''
  if (type.value === 'articles' || type.value === 'article') {
    const titleObj = e.title
    if (titleObj && typeof titleObj === 'object') return resolveTranslatedValue(titleObj, locale.value)
    return e.title || e.name || ''
  }
  return e.name || e.title || ''
})

const description = computed(() => {
  const e = entity.value
  if (!e) return ''
  if (type.value === 'articles' || type.value === 'article') {
    const content = e.excerpt || e.content
    if (content && typeof content === 'object') return resolveTranslatedValue(content, locale.value)?.substring(0, 120)
    return (content || '').substring(0, 120)
  }
  if (type.value === 'facilities' || type.value === 'facility') {
    return e.description || ''
  }
  if (type.value === 'staff' || type.value === 'doctor') {
    const bio = e.bio || e.specialization
    if (bio && typeof bio === 'object') return resolveTranslatedValue(bio, locale.value)
    return bio || ''
  }
  return ''
})

const imageSrc = computed(() => {
  const e = entity.value
  if (!e) return ''
  if (type.value === 'articles' || type.value === 'article') return e.cover_image || ''
  if (type.value === 'facilities' || type.value === 'facility') return e.cover_image || e.image || e.logo || ''
  if (type.value === 'staff' || type.value === 'doctor') return e.avatar || e.profile_image || ''
  if (type.value === 'stories' || type.value === 'story') return e.images?.[0] || e.image || ''
  return e.image || e.cover_image || e.avatar || ''
})

const entityId = computed(() => entity.value?.uuid || entity.value?.id)
const entityUuid = computed(() => entity.value?.uuid)

const link = computed(() => {
  const id = entityUuid.value || entityId.value
  if (!id) return '#'
  switch (type.value) {
    case 'articles':
    case 'article':
      return `/articles/${id}`
    case 'facilities':
    case 'facility':
      return `/facilities/${entityUuid.value || id}`
    case 'staff':
    case 'doctor':
      return `/doctors/${entityUuid.value || id}`
    case 'stories':
    case 'story':
      return `/stories/${id}`
    case 'job_posts':
    case 'job':
      return `/jobs/${id}`
    default:
      return '#'
  }
})

const categoryLabel = computed(() => {
  const e = entity.value
  if (!e) return ''
  const cat = e.category || e.category_name
  if (cat && typeof cat === 'object') return resolveTranslatedValue(cat.name || cat, locale.value)
  if (typeof cat === 'string') return cat
  return ''
})

const typeLabel = computed(() => {
  const map = {
    facilities: 'Facility',
    facility: 'Facility',
    staff: 'Staff',
    doctor: 'Doctor',
    articles: 'Article',
    article: 'Article',
    stories: 'Story',
    story: 'Story',
    job_posts: 'Job Post',
    job: 'Job Post',
  }
  return map[type.value] || type.value
})

const typeColor = computed(() => {
  const map = {
    facilities: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    facility: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    doctor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    articles: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    article: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    stories: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    story: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    job_posts: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    job: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  }
  return map[type.value] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
})

function goTo() {
  if (link.value !== '#') router.push(link.value)
}
</script>

<template>
  <div
    class="group card-base overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in-up"
    @click="goTo"
  >
    <div class="relative h-44 overflow-hidden bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 dark:from-slate-800 dark:to-slate-700">
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="$event.target.style.display = 'none'"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path v-if="type === 'articles' || type === 'article'" stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          <path v-else-if="type === 'facilities' || type === 'facility'" stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          <path v-else-if="type === 'staff' || type === 'doctor'" stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          <path v-else-if="type === 'stories' || type === 'story'" stroke-linecap="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          <path v-else stroke-linecap="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </div>

      <div class="absolute top-3 left-3 flex items-center gap-2">
        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm backdrop-blur-sm" :class="typeColor">
          {{ typeLabel }}
        </span>
        <span v-if="categoryLabel" class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-sm">
          {{ categoryLabel }}
        </span>
      </div>

      <div class="absolute top-3 right-3 z-10">
        <FavoriteButton
          :type="type"
          :id="entityId"
          size="sm"
        />
      </div>
    </div>

    <div class="p-4">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
        {{ title }}
      </h3>

      <p v-if="description" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
        {{ description }}
      </p>

      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span class="text-[11px] font-semibold text-brand-primary group-hover:underline flex items-center gap-1">
          {{ t('favorites.viewDetails') }}
          <svg class="w-3 h-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>
