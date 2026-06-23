<script setup>
import { useI18n } from 'vue-i18n';
import StatisticsCard from '../global/StatisticsCard.vue';

const { t } = useI18n();

defineProps({
  departmentsCount: { type: Number, default: 0 },
  childrenCount: { type: Number, default: 0 },
  imagesCount: { type: Number, default: 0 },
  documentsCount: { type: Number, default: 0 },
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatisticsCard
      :title="t('facilityDetail.quickStats.departments')"
      :value="departmentsCount"
      icon="apartment"
      color="primary"
    />
    <StatisticsCard
      :title="t('facilityDetail.quickStats.children') || 'Child Facilities'"
      :value="childrenCount"
      icon="account_tree"
      color="info"
    />
    <StatisticsCard
      :title="t('facilityDetail.gallery')"
      :value="imagesCount"
      icon="photo_library"
      color="success"
    />
    <StatisticsCard
      :title="t('facilityDetail.quickStats.certificates') || 'Documents'"
      :value="documentsCount"
      icon="description"
      color="warning"
    />
  </div>
</template>
