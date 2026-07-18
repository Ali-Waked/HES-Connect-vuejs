<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleField } from '../../composables/useLocaleField'
import { useI18n } from 'vue-i18n'
import FavoriteButton from '../favorites/FavoriteButton.vue'

const props = defineProps({
  job: { type: Object, required: true }
})

const router = useRouter()
const { localField } = useLocaleField()
const { t } = useI18n()

const title = computed(() => localField(props.job, 'title'))
const description = computed(() => {
  const desc = localField(props.job, 'description')
  return desc ? desc.substring(0, 120) + (desc.length > 120 ? '...' : '') : ''
})

const facilityName = computed(() => {
  const f = props.job.facility
  return f ? localField(f, 'name') : props.job.facility_name || ''
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function goToJob() {
  router.push(`/jobs/${props.job.slug || props.job.id}`)
}

const isExpiringSoon = computed(() => {
  if (!props.job.end_date) return false
  const diff = (new Date(props.job.end_date) - new Date()) / 86400000
  return diff < 7 && diff >= 0
})
</script>

<template>
  <article
    class="group card-base overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col"
    @click="goToJob"
  >
    <div v-if="job.cover_image" class="relative h-40 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
      <img :src="job.cover_image" :alt="title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <span v-if="job.employment_type" class="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-brand-primary text-[10px] font-semibold rounded-md">
        {{ job.employment_type.replace(/_/g, ' ') }}
      </span>
    </div>
    <div v-else class="relative h-40 overflow-hidden bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 dark:from-brand-primary/10 dark:to-brand-primary/5 flex items-center justify-center">
      <svg class="w-16 h-16 text-brand-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <span v-if="job.employment_type" class="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-brand-primary text-[10px] font-semibold rounded-md">
        {{ job.employment_type.replace(/_/g, ' ') }}
      </span>
    </div>

    <div class="p-5 flex flex-col flex-1">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
            {{ title }}
          </h3>
          <p v-if="facilityName" class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{{ facilityName }}</p>
        </div>
        <FavoriteButton :favoritable-id="job.uuid || job.id" favoritable-type="job_post" :is-favorited="job.is_favorited" size="sm" @click.stop />
      </div>

      <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
        {{ description }}
      </p>

      <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span :class="isExpiringSoon ? 'text-red-500 font-semibold' : ''">{{ $t('jobs.ends') }}: {{ formatDate(job.end_date) }}</span>
        </span>
        <span class="flex items-center gap-1" v-if="job.apply_method">
          <svg v-if="job.apply_method === 'email'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          {{ job.apply_method === 'email' ? $t('jobs.applyByEmail') || 'Email' : $t('jobs.applyByLink') || 'Link' }}
        </span>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-7 h-7 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
            {{ (facilityName || '?').charAt(0) }}
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ $t('jobs.created') }}: {{ formatDate(job.created_at) }}</span>
        </div>
        <span class="text-xs font-semibold text-brand-primary group-hover:underline shrink-0 flex items-center gap-1">
          {{ $t('jobs.applyNow') }}
          <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </span>
      </div>
    </div>
  </article>
</template>
