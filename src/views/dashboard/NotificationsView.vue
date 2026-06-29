<script setup>
import { useNotifications } from '../../composables/useNotifications'
import NotificationsPanel from '../../components/dashboard/Notifications/NotificationsPanel.vue'

useNotifications({ autoFetch: true, subscribeRealtime: true })
</script>

<template>
  <NotificationsPanel />
</template>
