const FACILITIES = [
  { id: 1, name: 'Nasser Medical Point', facility_type: 'medical_point', organization_name: 'Ministry of Health Gaza', latitude: 31.3478, longitude: 34.3012, rating: 4.2, review_count: 18, image: null },
  { id: 2, name: 'Al-Shifa Emergency Unit', facility_type: 'medical_point', organization_name: 'Ministry of Health Gaza', latitude: 31.5195, longitude: 34.4370, rating: 4.5, review_count: 42, image: null },
  { id: 3, name: 'MSF Emergency Pharmacy', facility_type: 'pharmacy', organization_name: 'Doctors Without Borders', latitude: 31.4990, longitude: 34.4601, rating: 4.7, review_count: 31, image: null },
  { id: 4, name: 'Al-Awda Clinic Jabalia', facility_type: 'clinic', organization_name: 'Al-Awda Hospital Foundation', latitude: 31.5310, longitude: 34.4826, rating: 4.6, review_count: 27, image: null },
  { id: 5, name: 'UNRWA Health Center Rafah', facility_type: 'clinic', organization_name: 'UNRWA Health Department', latitude: 31.2963, longitude: 34.2545, rating: 4.3, review_count: 15, image: null },
  { id: 6, name: 'European Gaza Hospital', facility_type: 'hospital', organization_name: 'Ministry of Health Gaza', latitude: 31.3430, longitude: 34.2987, rating: 4.8, review_count: 56, image: null },
  { id: 7, name: 'Kamal Adwan Hospital', facility_type: 'hospital', organization_name: 'Ministry of Health Gaza', latitude: 31.5560, longitude: 34.4965, rating: 4.9, review_count: 63, image: null },
  { id: 8, name: 'Al-Shifa Medical Complex', facility_type: 'hospital', organization_name: 'Ministry of Health Gaza', latitude: 31.5200, longitude: 34.4375, rating: 4.9, review_count: 89, image: null }
];

const STORIES = [
  { id: 2, title: 'Road to Recovery After Emergency Surgery', patient_first_name: 'Mohammed', content_excerpt: 'Following an emergency appendectomy, I was left with significant hospital bills and post-operative care costs...', collected_amount: 3200, target_amount: 5000, cover_image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
  { id: 4, title: 'A New Beginning for My Baby', patient_first_name: 'Rania', content_excerpt: 'My baby was born premature at 32 weeks. The neonatal team has been incredible...', collected_amount: 6100, target_amount: 8000, cover_image: 'https://images.unsplash.com/photo-1555252333-9f8e92a65df4?w=600&h=400&fit=crop' },
  { id: 1, title: 'Help Me Continue Physical Therapy', patient_first_name: 'Khalid', content_excerpt: 'I suffered a serious leg injury last year and the doctors advised intensive physical therapy...', collected_amount: 850, target_amount: 2000, cover_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop' }
];

const ARTICLES = [
  { id: 1, title: 'Managing Emergency Scenarios in Crisis Zones', category: 'Medical', author_name: 'Dr. Ahmed Hassan', published_at: 'Jun 1, 2026', views: 1240, tags: [{ name: 'Emergency', color: 'teal' }, { name: 'Crisis', color: 'red' }] },
  { id: 2, title: 'Pediatric Care During Displacement', category: 'Pediatrics', author_name: 'Dr. Fatima Al-Zahroa', published_at: 'Jun 3, 2026', views: 850, tags: [{ name: 'Pediatrics', color: 'blue' }, { name: 'Displacement', color: 'amber' }] },
  { id: 5, title: 'Maternal Health in Conflict Zones', category: 'Obstetrics', author_name: 'Dr. Samira Hamed', published_at: 'May 15, 2026', views: 520, tags: [{ name: 'Maternal', color: 'pink' }, { name: 'Health', color: 'teal' }] }
];

const JOBS = [
  { id: 1, facility_name: 'Al-Awda Clinic Jabalia', facility_type: 'clinic', title: 'Emergency Registered Nurse', apply_method: 'email', apply_value: 'hr@alawda.org', end_date: '2026-07-01' },
  { id: 2, facility_name: 'European Gaza Hospital', facility_type: 'hospital', title: 'Pediatric Specialist', apply_method: 'link', apply_value: 'https://careers.egh.ps/apply/pediatrics', end_date: '2026-07-15' },
  { id: 4, facility_name: 'Al-Shifa Medical Complex', facility_type: 'hospital', title: 'Senior Trauma Surgeon', apply_method: 'link', apply_value: 'https://alshifa.ps/jobs/trauma-surgeon', end_date: '2026-08-01' }
];

const DOCTORS = [
  { id: 7, name: 'Dr. Ahmed Hassan', specialization: 'Emergency Medicine', experience: 12, fee: 50, rating: 4.9, profile_image: null },
  { id: 2, name: 'Dr. Fatima Al-Zahroa', specialization: 'Pediatrics', experience: 8, fee: 40, rating: 4.8, profile_image: null },
  { id: 3, name: 'Dr. Omar Khalil', specialization: 'General Surgery', experience: 15, fee: 60, rating: 4.7, profile_image: null },
  { id: 5, name: 'Dr. Samira Hamed', specialization: 'Obstetrics & Gynecology', experience: 9, fee: 55, rating: 4.6, profile_image: null }
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Free Vaccination Campaign', content: 'Ministry of Health Gaza is running a free vaccination campaign across all clinics this week.', date: 'Jun 5, 2026' }
];

export const mockPublicData = {
  stats: () => ({
    hospitals: FACILITIES.filter(f => f.facility_type === 'hospital').length,
    doctors: DOCTORS.length,
    pharmacies: FACILITIES.filter(f => f.facility_type === 'pharmacy').length,
    patients: 2500
  }),

  facilitiesMap: () =>
    FACILITIES.map(({ id, name, latitude, longitude, facility_type }) => ({
      id, name, latitude, longitude, facility_type
    })),

  facilitiesCountsByType: () => ({
    hospital: FACILITIES.filter(f => f.facility_type === 'hospital').length,
    clinic: FACILITIES.filter(f => f.facility_type === 'clinic').length,
    medical_point: FACILITIES.filter(f => f.facility_type === 'medical_point').length,
    pharmacy: FACILITIES.filter(f => f.facility_type === 'pharmacy').length
  }),

  platformOverview: () => ({
    total_users: 2847,
    appointments_completed: 12540,
    articles_published: 48,
    active_stories: 12,
    total_donations: 186500
  }),

  facilitiesTop: (limit = 6) =>
    [...FACILITIES].sort((a, b) => b.rating - a.rating).slice(0, limit),

  storiesLatest: (limit = 3) => STORIES.slice(0, limit),

  articlesLatest: (limit = 3) => ARTICLES.slice(0, limit),

  jobsLatest: (limit = 3) => JOBS.slice(0, limit),

  doctorsTop: (limit = 4) => DOCTORS.slice(0, limit),

  announcementsActive: () => ANNOUNCEMENTS
};
