import { ref, onMounted } from 'vue';
import * as publicApi from '../api/public';

export function useLandingData() {
  const loading = ref(true);
  const stats = ref(null);
  const categoryCounts = ref(null);
  const overview = ref(null);
  const topFacilities = ref([]);
  const stories = ref([]);
  const articles = ref([]);
  const jobs = ref([]);
  const doctors = ref([]);
  const announcements = ref([]);

  onMounted(async () => {
    try {
      const [
        statsData,
        countsData,
        overviewData,
        facilitiesData,
        storiesData,
        articlesData,
        jobsData,
        doctorsData,
        announcementsData
      ] = await Promise.all([
        publicApi.getStats(),
        publicApi.getFacilitiesCountsByType(),
        publicApi.getPlatformOverview(),
        publicApi.getFacilitiesTop(6),
        publicApi.getStoriesLatest(3),
        publicApi.getArticlesLatest(3),
        publicApi.getJobsLatest(3),
        publicApi.getDoctorsTop(4),
        publicApi.getAnnouncementsActive()
      ]);

      stats.value = statsData;
      categoryCounts.value = countsData;
      overview.value = overviewData;
      topFacilities.value = facilitiesData;
      stories.value = storiesData;
      articles.value = articlesData;
      jobs.value = jobsData;
      doctors.value = doctorsData;
      announcements.value = announcementsData;
    } finally {
      loading.value = false;
    }
  });

  return {
    loading,
    stats,
    categoryCounts,
    overview,
    topFacilities,
    stories,
    articles,
    jobs,
    doctors,
    announcements
  };
}
