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
  { id: 1, title: 'Help Me Continue Physical Therapy', patient_first_name: 'Khalid', content_excerpt: 'I suffered a serious leg injury last year and the doctors advised intensive physical therapy to regain full mobility. We have completed 4 of the 12 required sessions but can no longer afford to continue.', collected_amount: 850, target_amount: 2000, cover_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop' },
  { id: 2, title: 'Road to Recovery After Emergency Surgery', patient_first_name: 'Mohammed', content_excerpt: 'Following an emergency appendectomy, I was left with significant hospital bills and post-operative care costs. The surgery was successful but the road to full recovery requires medication and follow-up visits.', collected_amount: 3200, target_amount: 5000, cover_image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
  { id: 3, title: 'My Journey with Asthma – Breathing Again', patient_first_name: 'Layla', content_excerpt: 'I have been living with severe asthma since childhood. The dust and air quality in Gaza has made my condition much worse this year. I wanted to share my story to raise awareness.', collected_amount: 0, target_amount: 0, cover_image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop' },
  { id: 4, title: 'A New Beginning for My Baby', patient_first_name: 'Rania', content_excerpt: 'My baby was born premature at 32 weeks. The neonatal team has been incredible. We are raising funds to cover the remaining hospital costs and bring our baby home safely.', collected_amount: 6100, target_amount: 8000, cover_image: 'https://images.unsplash.com/photo-1555252333-9f8e92a65df4?w=600&h=400&fit=crop' },
  { id: 5, title: 'Mental Health Matters – My Story', patient_first_name: 'Amir', content_excerpt: 'I have been struggling with anxiety and depression for the past two years due to the ongoing conflict. I wanted to share my experience to break the stigma around mental health in our community.', collected_amount: 0, target_amount: 0, cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop' }
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
  { id: 1, name: 'Dr. Ahmed Hassan', specialization: 'Emergency Medicine', experience: 12, fee: 50, rating: 4.9, profile_image: null, facility_id: 7 },
  { id: 2, name: 'Dr. Fatima Al-Zahroa', specialization: 'Pediatrics', experience: 8, fee: 40, rating: 4.8, profile_image: null, facility_id: 6 },
  { id: 3, name: 'Dr. Omar Khalil', specialization: 'General Surgery', experience: 15, fee: 60, rating: 4.7, profile_image: null, facility_id: 8 },
  { id: 4, name: 'Dr. Youssef Nasser', specialization: 'Cardiology', experience: 20, fee: 70, rating: 4.9, profile_image: null, facility_id: 8 },
  { id: 5, name: 'Dr. Samira Hamed', specialization: 'Obstetrics & Gynecology', experience: 9, fee: 55, rating: 4.6, profile_image: null, facility_id: 6 },
  { id: 6, name: 'Dr. Khalid Abu Amr', specialization: 'Orthopedics', experience: 14, fee: 45, rating: 4.7, profile_image: null, facility_id: 7 },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Free Vaccination Campaign', content: 'Ministry of Health Gaza is running a free vaccination campaign across all clinics this week.', date: 'Jun 5, 2026' }
];

const FACILITY_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=500&fit=crop'
];

const FACILITY_DETAILS = {
  6: {
    description: 'European Gaza Hospital is one of the largest medical facilities in the southern Gaza Strip, providing comprehensive healthcare services including emergency care, surgery, pediatrics, and maternity services. Equipped with modern medical technology and staffed by highly qualified professionals.',
    location: 'Khan Younis, Gaza Strip',
    phone: '+970 8 205 5000',
    images: FACILITY_IMAGES.slice(0, 4),
    doctors: [DOCTORS[1], DOCTORS[4]],
  },
  7: {
    description: 'Kamal Adwan Hospital serves the northern Gaza region with a full range of medical services. The hospital features advanced emergency departments, surgical wards, and specialized clinics for internal medicine and orthopedics.',
    location: 'Beit Lahia, Gaza Strip',
    phone: '+970 8 256 4000',
    images: FACILITY_IMAGES.slice(1, 5),
    doctors: [DOCTORS[0], DOCTORS[5]],
  },
  8: {
    description: 'Al-Shifa Medical Complex is the largest medical facility in Gaza, offering specialized care across multiple departments. With a team of over 500 healthcare professionals, it serves as the primary referral hospital for the entire region.',
    location: 'Gaza City, Gaza Strip',
    phone: '+970 8 262 4000',
    images: FACILITY_IMAGES.slice(0, 5),
    doctors: [DOCTORS[2], DOCTORS[3]],
  },
  1: {
    description: 'Nasser Medical Point provides essential primary healthcare services to the local community, including general consultations, vaccinations, and basic emergency care.',
    location: 'Rafah, Gaza Strip',
    phone: '+970 8 242 1000',
    images: FACILITY_IMAGES.slice(0, 3),
    doctors: [],
  },
  2: {
    description: 'Al-Shifa Emergency Unit operates as a dedicated emergency response center, handling urgent medical cases and trauma care around the clock.',
    location: 'Gaza City, Gaza Strip',
    phone: '+970 8 262 4100',
    images: FACILITY_IMAGES.slice(2, 5),
    doctors: [],
  },
  3: {
    description: 'MSF Emergency Pharmacy provides essential medications and pharmaceutical services to the community, operated in partnership with Doctors Without Borders.',
    location: 'Deir al-Balah, Gaza Strip',
    phone: '+970 59 800 0001',
    images: [],
    doctors: [],
  },
  4: {
    description: 'Al-Awda Clinic Jabalia offers comprehensive outpatient services including general medicine, pediatrics, and preventive care to the Jabalia community.',
    location: 'Jabalia, Gaza Strip',
    phone: '+970 8 248 5000',
    images: FACILITY_IMAGES.slice(1, 4),
    doctors: [],
  },
  5: {
    description: 'UNRWA Health Center Rafah provides primary healthcare services to Palestinian refugees, including maternal health, immunization, and chronic disease management.',
    location: 'Rafah, Gaza Strip',
    phone: '+970 8 244 1000',
    images: [],
    doctors: [],
  }
};

const REVIEW_NAMES = ['Ali Hamed', 'Sara Zaki', 'Omar Issa', 'Nour Salem', 'Hasan Ali', 'Layla Ibrahim', 'Khalid Abu Amr', 'Rania Saleh', 'Amir Zaki', 'Mona Youssef'];
const REVIEW_TEXTS = [
  'Excellent service and very professional staff. Highly recommended!',
  'The doctors were very attentive and the facilities are clean and well-equipped.',
  'Good experience overall, though waiting times could be improved.',
  'I received excellent care during my emergency visit. Thank you to the entire team.',
  'Very friendly staff and modern equipment. Made me feel comfortable throughout.',
  'The best healthcare experience I have had in Gaza. Truly world-class service.',
  'Professional medical team with great bedside manner. Would definitely visit again.',
  'Affordable and high-quality healthcare. The community is lucky to have this facility.',
  'Quick response and efficient treatment. Very grateful for their help.',
  'Knowledgeable doctors who take time to explain everything. Very reassuring.'
];

const DOCTOR_DETAILS = {
  1: {
    facility: FACILITIES[7],
    gallery: [],
    about: 'Dr. Ahmed Hassan is a highly experienced emergency medicine specialist with over 12 years of practice in critical care settings. He has trained at leading medical institutions and is known for his quick decision-making and compassionate patient care.',
  },
  2: {
    facility: FACILITIES[5],
    gallery: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop',
    ],
    about: 'Dr. Fatima Al-Zahroa is a dedicated pediatrician with 8 years of experience caring for children in Gaza. She specializes in treating common childhood illnesses and providing preventive care education to parents.',
  },
  3: {
    facility: FACILITIES[7],
    gallery: [],
    about: 'Dr. Omar Khalil is a senior general surgeon with 15 years of experience performing a wide range of surgical procedures. He has successfully handled numerous complex cases and is respected by peers and patients alike.',
  },
  4: {
    facility: FACILITIES[7],
    gallery: [
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop',
    ],
    about: 'Dr. Youssef Nasser is a leading cardiologist with two decades of experience in diagnosing and treating heart conditions. He has introduced advanced cardiac care protocols to Gaza\'s healthcare system.',
  },
  5: {
    facility: FACILITIES[5],
    gallery: [],
    about: 'Dr. Samira Hamed is an accomplished obstetrician and gynecologist with 9 years of experience. She is passionate about maternal health and has delivered thousands of babies safely in challenging conditions.',
  },
  6: {
    facility: FACILITIES[6],
    gallery: [],
    about: 'Dr. Khalid Abu Amr is a skilled orthopedic surgeon with 14 years of experience treating bone and joint conditions. He specializes in trauma reconstruction and sports medicine.',
  }
};

function generateReviews(count, source, sourceId, sourceLabel) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    user_name: REVIEW_NAMES[i % REVIEW_NAMES.length],
    user_avatar: null,
    rating: 4 + (i % 2 === 0 ? 1 : 0),
    comment: REVIEW_TEXTS[i % REVIEW_TEXTS.length],
    date: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0],
    source,
    source_label: sourceLabel,
    source_id: sourceId,
  }));
}

const FEATURED_REVIEWS = [
  ...generateReviews(3, 'platform', null, 'Platform Review').map((r, i) => ({ ...r, id: i + 1, rating: 5 })),
  ...generateReviews(3, 'facility', 6, 'Facility Review').map((r, i) => ({ ...r, id: i + 4, rating: [4, 5, 4][i] })),
  ...generateReviews(3, 'doctor', 1, 'Doctor Review').map((r, i) => ({ ...r, id: i + 7, rating: 5 })),
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

  storiesAll: () => STORIES,

  storiesLatest: (limit = 3) => STORIES.slice(0, limit),

  articlesLatest: (limit = 3) => ARTICLES.slice(0, limit),

  jobsLatest: (limit = 3) => JOBS.slice(0, limit),

  doctorsTop: (limit = 4) => DOCTORS.slice(0, limit),

  doctorsAll: () => DOCTORS,

  announcementsActive: () => ANNOUNCEMENTS,

  facilityDetail: (id) => {
    const fac = FACILITIES.find(f => f.id === id);
    if (!fac) return null;
    const details = FACILITY_DETAILS[id] || {};
    return {
      ...fac,
      ...details,
      images: details.images || [],
      doctors: details.doctors || [],
      reviews: generateReviews(8, 'facility', id, 'Facility Review'),
    };
  },

  doctorDetail: (id) => {
    const doc = DOCTORS.find(d => d.id === id);
    if (!doc) return null;
    const details = DOCTOR_DETAILS[id] || {};
    return {
      ...doc,
      ...details,
      reviews: generateReviews(10, 'doctor', id, 'Doctor Review'),
      related_doctors: DOCTORS.filter(d => d.id !== id && d.facility_id === doc.facility_id).slice(0, 3),
    };
  },

  doctorsByFacility: (facilityId) =>
    DOCTORS.filter(d => d.facility_id === facilityId).map(d => ({
      ...d,
      about: (DOCTOR_DETAILS[d.id] || {}).about || '',
    })),

  featuredReviews: () => FEATURED_REVIEWS,

  platformStats: () => ({
    total_users: 2847,
    total_facilities: FACILITIES.length,
    total_doctors: DOCTORS.length,
    average_rating: (FACILITIES.reduce((s, f) => s + f.rating, 0) / FACILITIES.length).toFixed(1),
  }),
};
