import { mockPublicData } from './mockPublicData';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchApi(path, mockFn) {
  if (!API_BASE) {
    return mockFn();
  }

  try {
    const res = await fetch(`${API_BASE}/api${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    return mockFn();
  }
}

export const getStats = () =>
  fetchApi('/stats', mockPublicData.stats);

export const getFacilitiesMap = () =>
  fetchApi('/facilities/map', mockPublicData.facilitiesMap);

export const getFacilitiesCountsByType = () =>
  fetchApi('/facilities/counts-by-type', mockPublicData.facilitiesCountsByType);

export const getPlatformOverview = () =>
  fetchApi('/platform-overview', mockPublicData.platformOverview);

export const getFacilitiesTop = (limit = 6) =>
  fetchApi(`/facilities/top?limit=${limit}`, () => mockPublicData.facilitiesTop(limit));

export const getStoriesLatest = (limit = 3) =>
  fetchApi(`/stories/latest?limit=${limit}`, () => mockPublicData.storiesLatest(limit));

export const getArticlesLatest = (limit = 3) =>
  fetchApi(`/articles/latest?limit=${limit}`, () => mockPublicData.articlesLatest(limit));

export const getJobsLatest = (limit = 3) =>
  fetchApi(`/jobs/latest?limit=${limit}`, () => mockPublicData.jobsLatest(limit));

export const getDoctorsTop = (limit = 4) =>
  fetchApi(`/doctors/top?limit=${limit}`, () => mockPublicData.doctorsTop(limit));

export const getAnnouncementsActive = () =>
  fetchApi('/announcements/active', mockPublicData.announcementsActive);
