import { ref, onMounted } from 'vue';
import * as publicApi from '../api/public';
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange';

export function useLandingData() {
  const loading = ref(true);
  const stats = ref(null);
  const categoryCounts = ref(null);
  const overview = ref(null);
  const platformStats = ref(null);
  const featuredReviews = ref([]);
  const topFacilities = ref([]);
  const stories = ref([]);
  const articles = ref([]);
  const jobs = ref([]);
  const doctors = ref([]);
  const announcements = ref([]);

  async function fetchAll() {
    loading.value = true;
    try {
      const [
        statsData,
        countsData,
        overviewData,
        platformStatsData,
        featuredReviewsData,
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
        publicApi.getPlatformStats(),
        publicApi.getFeaturedReviews(),
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
      platformStats.value = platformStatsData;
      featuredReviews.value = featuredReviewsData;
      topFacilities.value = facilitiesData;
      stories.value = storiesData;
      articles.value = articlesData;
      jobs.value = jobsData;
      doctors.value = doctorsData;
      announcements.value = announcementsData;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchAll();
  });

  useRefetchOnLanguageChange(fetchAll);

  return {
    loading,
    stats,
    categoryCounts,
    overview,
    platformStats,
    featuredReviews,
    topFacilities,
    stories,
    articles,
    jobs,
    doctors,
    announcements
  };
}
