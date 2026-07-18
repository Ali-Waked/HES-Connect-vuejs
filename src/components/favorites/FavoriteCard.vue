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

const entity = computed(() => props.item.entity || props.item.item || props.item)
const type = computed(() => props.item.normalizedType || props.item.type)

const title = computed(() => {
  const e = entity.value
  if (!e) return ''
  const field = e.title || e.name
  if (field && typeof field === 'object') return resolveTranslatedValue(field, locale.value)
  return field || ''
})

const description = computed(() => {
  const e = entity.value
  if (!e) return ''
  const field = e.excerpt || e.content || e.bio || e.specialization || e.description
  if (field && typeof field === 'object') return resolveTranslatedValue(field, locale.value)?.substring(0, 120)
  return (field || '').substring(0, 120)
})

const imageSrc = computed(() => {
  const e = entity.value
  if (!e) return ''
  if (type.value === 'article') return e.cover_image || ''
  if (type.value === 'facility') return e.cover_image || e.image || e.logo || ''
  if (type.value === 'staff') return e.avatar || e.profile_image || ''
  if (type.value === 'story') return e.cover_image || e.images?.[0] || e.image || ''
  return e.image || e.cover_image || e.avatar || ''
})

const entityId = computed(() => entity.value?.uuid || entity.value?.id)

const link = computed(() => {
  const id = entityId.value
  if (!id) return '#'
  switch (type.value) {
    case 'article': return `/articles/${id}`
    case 'facility': return `/facilities/${id}`
    case 'staff': return `/doctors/${id}`
    case 'story': return `/stories/${id}`
    case 'job': return `/jobs/${id}`
    default: return '#'
  }
})

const typeLabel = computed(() => {
  const map = {
    facility: 'Facility',
    staff: 'Staff',
    article: 'Article',
    story: 'Story',
    job: 'Job',
  }
  return map[type.value] || type.value
})

const typeColor = computed(() => {
  const map = {
    facility: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    article: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    story: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
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
    class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    @click="goTo"
  >
    <!-- Image -->
    <div class="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="$event.target.style.display = 'none'"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/40 flex items-center justify-center">
        <svg class="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
        </svg>
      </div>

      <!-- Type Badge -->
      <div class="absolute top-3 left-3">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-sm" :class="typeColor">
          {{ typeLabel }}
        </span>
      </div>

      <!-- Favorite Button -->
      <div class="absolute top-3 right-3 z-10">
        <FavoriteButton
          :type="type"
          :id="entityId"
          size="sm"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 space-y-3">
      <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
        {{ title }}
      </h3>

      <p v-if="description" class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {{ description }}
      </p>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span class="text-xs font-semibold text-brand-primary group-hover:underline flex items-center gap-1">
          {{ t('favorites.viewDetails') }}
          <svg class="w-3 h-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>
