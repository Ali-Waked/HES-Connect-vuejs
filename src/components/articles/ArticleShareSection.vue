<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps({
  article: { type: Object, required: true },
})

const { t } = useI18n()
const router = useRouter()

const copied = ref(false)

const shareUrl = computed(() => {
  const base = window.location.origin
  return `${base}/articles/${props.article.uuid || props.article.id}`
})

const shareTitle = computed(() => {
  const title = props.article.title
  return typeof title === 'object' ? (title.en || '') : title
})

function shareOn(platform) {
  const url = encodeURIComponent(shareUrl.value)
  const text = encodeURIComponent(shareTitle.value)
  let href = ''
  switch (platform) {
    case 'facebook':
      href = `https://www.facebook.com/sharer/sharer.php?u=${url}`
      break
    case 'twitter':
      href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      break
    case 'whatsapp':
      href = `https://wa.me/?text=${text}%20${url}`
      break
  }
  if (href) window.open(href, '_blank', 'width=600,height=500')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = shareUrl.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <div class="flex items-center gap-3 flex-wrap">
    <span class="text-sm font-semibold text-slate-600 dark:text-slate-400">
      {{ t('articleDetail.share') }}:
    </span>
    <button
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:brightness-110 transition-all duration-200 shadow-sm cursor-pointer"
      :title="t('articleDetail.shareFacebook')"
      @click="shareOn('facebook')"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
    </button>
    <button
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all duration-200 shadow-sm cursor-pointer"
      :title="t('articleDetail.shareTwitter')"
      @click="shareOn('twitter')"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </button>
    <button
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:brightness-110 transition-all duration-200 shadow-sm cursor-pointer"
      :title="t('articleDetail.shareWhatsApp')"
      @click="shareOn('whatsapp')"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </button>
    <button
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm relative cursor-pointer"
      :title="t('articleDetail.copyLink')"
      @click="copyLink"
    >
      <svg v-if="!copied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
      <svg v-else class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
      <span
        v-if="copied"
        class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg"
      >
        {{ t('articleDetail.linkCopied') }}
      </span>
    </button>
  </div>
</template>
