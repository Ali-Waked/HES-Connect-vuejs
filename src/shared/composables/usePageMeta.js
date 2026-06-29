import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function usePageMeta(defaultTitle) {
  const route = useRoute()
  const title = ref(defaultTitle || '')

  const pageTitle = computed(() => {
    const meta = route.meta
    if (meta.title) return meta.title
    if (route.name) {
      return String(route.name)
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }
    return title.value
  })

  return { pageTitle }
}
