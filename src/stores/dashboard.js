import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
  // --- Seed Data definitions ---
  const defaultOrganizations = [
    { id: 1, name: 'Al-Awda Hospital Foundation', description: 'Private healthcare provider in northern Gaza', type: 'Private', created: 'May 7, 2026', updated: 'Jun 6, 2026' },
    { id: 2, name: 'Palestinian Red Crescent', description: 'Emergency medical services and ambulance', type: 'NGO', created: 'May 2, 2026', updated: 'Jun 5, 2026' },
    { id: 3, name: 'Islamic Relief Worldwide', description: 'Humanitarian aid and health services', type: 'NGO', created: 'Apr 27, 2026', updated: 'Jun 4, 2026' },
    { id: 4, name: 'World Health Organization', description: 'WHO field operations in Gaza Strip', type: 'International', created: 'Apr 22, 2026', updated: 'May 27, 2026' },
    { id: 5, name: 'Doctors Without Borders', description: 'International medical humanitarian organization', type: 'NGO', created: 'Apr 17, 2026', updated: 'May 30, 2026' },
    { id: 6, name: 'UNRWA Health Department', description: 'United Nations Relief and Works Agency health services', type: 'UN Agency', created: 'Apr 12, 2026', updated: 'Jun 3, 2026' },
    { id: 7, name: 'Ministry of Health Gaza', description: 'Main governmental health authority in the Gaza Strip', type: 'Government', created: 'Apr 7, 2026', updated: 'Jun 1, 2026' }
  ];

  const defaultFacilities = [
    { id: 1, name: 'Nasser Medical Point', type: 'Medical Point', organization: 'Ministry of Health Gaza', parent: '', location: '31.3478, 34.3012', files: '' },
    { id: 2, name: 'Al-Shifa Emergency Unit', type: 'Medical Point', organization: 'Ministry of Health Gaza', parent: '', location: '31.5195, 34.4370', files: '' },
    { id: 3, name: 'MSF Emergency Pharmacy', type: 'Pharmacy', organization: 'Doctors Without Borders', parent: '', location: '31.4990, 34.4601', files: '' },
    { id: 4, name: 'Al-Awda Clinic Jabalia', type: 'Clinic', organization: 'Al-Awda Hospital Foundation', parent: '', location: '31.5310, 34.4826', files: '' },
    { id: 5, name: 'UNRWA Health Center Rafah', type: 'Clinic', organization: 'UNRWA Health Department', parent: '', location: '31.2963, 34.2545', files: '' },
    { id: 6, name: 'European Gaza Hospital', type: 'Hospital', organization: 'Ministry of Health Gaza', parent: '', location: '31.3430, 34.2987', files: '' },
    { id: 7, name: 'Kamal Adwan Hospital', type: 'Hospital', organization: 'Ministry of Health Gaza', parent: '', location: '31.5560, 34.4965', files: '' },
    { id: 8, name: 'Al-Shifa Medical Complex', type: 'Hospital', organization: 'Ministry of Health Gaza', parent: '', location: '31.5200, 34.4375', files: '' }
  ];

  const defaultStories = [
    { id: 1, title: 'Help Me Continue Physical Therapy', images: 0, patient: 'Khalid Abu Amr', status: 'Pending', fundraising: true, raised: 850, goal: 2000, created: 'Jun 5, 2026', cover: null, content: 'I suffered a serious leg injury last year and the doctors advised intensive physical therapy to regain full mobility. We have completed 4 of the 12 required sessions but can no longer afford to continue. Your support will help me walk again and return to my daily life.', gallery: [] },
    { id: 2, title: 'Road to Recovery After Emergency Surgery', images: 2, patient: 'Mohammed Al-Masri', status: 'Approved', fundraising: true, raised: 3200, goal: 5000, created: 'Jun 4, 2026', cover: null, content: 'Following an emergency appendectomy, I was left with significant hospital bills and post-operative care costs. The surgery was successful but the road to full recovery requires medication and follow-up visits that we struggle to afford. Every contribution brings me closer to full health.', gallery: ['gallery-1','gallery-2'] },
    { id: 3, title: 'My Journey with Asthma – Breathing Again', images: 1, patient: 'Layla Ibrahim', status: 'Approved', fundraising: false, raised: 0, goal: 0, created: 'Jun 1, 2026', cover: null, content: 'I have been living with severe asthma since childhood. The dust and air quality in Gaza has made my condition much worse this year. I wanted to share my story to raise awareness and thank all the healthcare workers who have helped me breathe easier and live a normal life again.', gallery: ['gallery-3'] },
    { id: 4, title: 'A New Beginning for My Baby', images: 3, patient: 'Rania Saleh', status: 'Pending', fundraising: true, raised: 6100, goal: 8000, created: 'May 29, 2026', cover: null, content: 'My baby was born premature at 32 weeks. The neonatal team has been incredible. We are raising funds to cover the remaining hospital costs and bring our baby home safely.', gallery: ['gallery-4','gallery-5','gallery-6'] },
    { id: 5, title: 'Mental Health Matters – My Story', images: 0, patient: 'Amir Zaki', status: 'Rejected', fundraising: false, raised: 0, goal: 0, created: 'May 25, 2026', cover: null, content: 'I have been struggling with anxiety and depression for the past two years due to the ongoing conflict. I wanted to share my experience to break the stigma around mental health in our community and encourage others to seek help. Mental health is just as important as physical health.', gallery: [] }
  ];

  const defaultStaff = [
    { id: 1, name: 'Dr. Ahmed Hassan', email: 'ahmed.hassan@health.ps', specialization: 'Emergency Medicine', experience: 12, fee: 50, provider: 'Local', lastSeen: 'about 5 hours ago', status: 'Online', role_id: 3, profile: { phone: '+970 59-123-4567', gender: 'Male', birthDate: '1985-05-15', address: 'Remal District, Gaza City', coverImage: null } },
    { id: 2, name: 'Dr. Fatima Al-Zahroa', email: 'fatima.zahroa@gmail.com', specialization: 'Pediatrics', experience: 8, fee: 40, provider: 'Google', lastSeen: 'about 12 hours ago', status: 'Online' },
    { id: 3, name: 'Dr. Omar Khalil', email: 'omar.khalil@health.ps', specialization: 'General Surgery', experience: 15, fee: 60, provider: 'Local', lastSeen: '2 days ago', status: 'Offline' },
    { id: 4, name: 'Dr. Youssef Nasser', email: 'youssef.nasser@health.ps', specialization: 'Internal Medicine', experience: 10, fee: 45, provider: 'Local', lastSeen: '3 days ago', status: 'Offline' },
    { id: 5, name: 'Dr. Samira Hamed', email: 'samira.hamed@gmail.com', specialization: 'Obstetrics & Gynecology', experience: 9, fee: 55, provider: 'Google', lastSeen: '5 days ago', status: 'Offline' }
  ];

  const defaultPatients = [
    { id: 1, name: 'Khalid Abu Amr', email: 'khalid.abuamr@gmail.com', provider: 'Google', lastSeen: 'about 6 hours ago', joined: 'May 17, 2026', status: 'Online' },
    { id: 2, name: 'Mohammed Al-Masri', email: 'mohammed.masri@health.ps', provider: 'Local', lastSeen: 'about 8 hours ago', joined: 'May 18, 2026', status: 'Online' },
    { id: 3, name: 'Layla Ibrahim', email: 'layla.ibrahim@gmail.com', provider: 'Google', lastSeen: '2 days ago', joined: 'May 22, 2026', status: 'Offline' },
    { id: 4, name: 'Rania Saleh', email: 'rania.saleh@gmail.com', provider: 'Google', lastSeen: '3 days ago', joined: 'May 25, 2026', status: 'Offline' },
    { id: 5, name: 'Amir Zaki', email: 'amir.zaki@health.ps', provider: 'Local', lastSeen: '5 days ago', joined: 'May 28, 2026', status: 'Offline' }
  ];

  const defaultDepartments = [
    { id: 1, name: 'Internal Medicine', facility: 'Al-Awda Clinic Jabalia', head: 'Dr. Youssef Nasser', created: '6/4/2026' },
    { id: 2, name: 'Surgery Department', facility: 'European Gaza Hospital', head: 'Dr. Omar Khalil', created: '5/31/2026' },
    { id: 3, name: 'Pediatrics Ward', facility: 'Kamal Adwan Hospital', head: 'Dr. Fatima Al-Zahroa', created: '5/29/2026' },
    { id: 4, name: 'Emergency Unit', facility: 'Al-Shifa Medical Complex', head: 'Dr. Ahmed Hassan', created: '5/27/2026' }
  ];

  const defaultArticles = [
    { id: 1, author: 'Dr. Ahmed Hassan', title: 'Managing Emergency Scenarios in Crisis Zones', content: 'In crisis zones, emergency medical management requires a unique set of skills and rapid decision-making...', category: 'Medical', status: 'published', views: 1240, publish_date: 'Jun 1, 2026', tags: [1, 4] },
    { id: 2, author: 'Dr. Fatima Al-Zahroa', title: 'Pediatric Care During Displacement', content: 'Displacement presents significant challenges for pediatric healthcare, including lack of nutrition and clean water...', category: 'Pediatrics', status: 'published', views: 850, publish_date: 'Jun 3, 2026', tags: [3, 4] },
    { id: 3, author: 'Dr. Omar Khalil', title: 'Advanced Surgical Techniques for Trauma', content: 'Trauma surgery in resource-limited settings demands innovation and strict adherence to core principles...', category: 'Surgery', status: 'pending_review', views: 0, publish_date: null, tags: [1, 6] },
    { id: 4, author: 'Staff Writer', title: 'Building Resilient Health Systems', content: 'Resilience in health systems is built through community engagement and robust infrastructure...', category: 'Health Policy', status: 'draft', views: 0, publish_date: null, tags: [4, 5] },
    { id: 5, author: 'Dr. Samira Hamed', title: 'Maternal Health in Conflict Zones', content: 'Conflict zones significantly impact maternal health outcomes. This article explores strategies for improvement...', category: 'Obstetrics', status: 'archived', views: 520, publish_date: 'May 15, 2026', tags: [4, 6] }
  ];

  const defaultJobs = [
    { id: 1, facility: 'Al-Awda Clinic Jabalia', author: 'Dr. Ahmed Hassan', title: 'Emergency Registered Nurse', description: 'We are looking for a dedicated Registered Nurse to join our emergency medical team in Jabalia. Experience in trauma care is highly preferred.', status: 'approved', created_date: 'Jun 1, 2026', end_date: 'Jul 1, 2026', apply_method: 'email', apply_value: 'hr@alawda.org' },
    { id: 2, facility: 'European Gaza Hospital', author: 'Staff Writer', title: 'Pediatric Specialist', description: 'Seeking an experienced Pediatric Specialist for full-time duty at the European Gaza Hospital. Must be board certified.', status: 'approved', created_date: 'Jun 3, 2026', end_date: 'Jul 15, 2026', apply_method: 'link', apply_value: 'https://careers.egh.ps/apply/pediatrics' },
    { id: 3, facility: 'Kamal Adwan Hospital', author: 'Dr. Fatima Al-Zahroa', title: 'Pharmacy Technician', description: 'Kamal Adwan Hospital is hiring a Pharmacy Technician to assist in medication dispensing and inventory management.', status: 'pending', created_date: 'Jun 5, 2026', end_date: 'Jun 30, 2026', apply_method: 'email', apply_value: 'jobs@kamaladwan.ps' },
    { id: 4, facility: 'Al-Shifa Medical Complex', author: 'Dr. Ahmed Hassan', title: 'Senior Trauma Surgeon', description: 'Lead surgeon position available for our trauma unit. Minimum 10 years of surgical experience required.', status: 'pending', created_date: 'Jun 6, 2026', end_date: 'Aug 1, 2026', apply_method: 'link', apply_value: 'https://alshifa.ps/jobs/trauma-surgeon' }
  ];

  // --- States ---
  const organizations = ref([]);
  const facilities = ref([]);
  const stories = ref([]);
  const departments = ref([]);
  const articles = ref([]);
  const jobs = ref([]);
  const staff = ref([]);
  const patients = ref([]);
  const toasts = ref([]);
  let toastIdCounter = 0;

  // User stats (static for now)
  const userStats = ref({ total: 10, staff: 5, patients: 5, online: 3 });

  // --- Initialize state from LocalStorage or fallbacks ---
  const initializeStore = () => {
    const storedOrgs = localStorage.getItem('hes_organizations');
    if (storedOrgs) {
      try { organizations.value = JSON.parse(storedOrgs); } 
      catch (e) { organizations.value = defaultOrganizations; }
    } else {
      organizations.value = defaultOrganizations;
      saveOrgs();
    }

    const storedFacs = localStorage.getItem('hes_facilities');
    if (storedFacs) {
      try { facilities.value = JSON.parse(storedFacs); }
      catch (e) { facilities.value = defaultFacilities; }
    } else {
      facilities.value = defaultFacilities;
      saveFacilities();
    }

    const storedStories = localStorage.getItem('hes_stories');
    if (storedStories) {
      try { stories.value = JSON.parse(storedStories); }
      catch (e) { stories.value = defaultStories; }
    } else {
      stories.value = defaultStories;
      saveStories();
    }

    const storedDepts = localStorage.getItem('hes_departments');
    if (storedDepts) {
      try { departments.value = JSON.parse(storedDepts); }
      catch (e) { departments.value = defaultDepartments; }
    } else {
      departments.value = defaultDepartments;
      saveDepartments();
    }

    const storedStaff = localStorage.getItem('hes_staff');
    if (storedStaff) {
      try { staff.value = JSON.parse(storedStaff); }
      catch (e) { staff.value = defaultStaff; }
    } else {
      staff.value = defaultStaff;
      saveStaff();
    }

    const storedPatients = localStorage.getItem('hes_patients');
    if (storedPatients) {
      try { patients.value = JSON.parse(storedPatients); }
      catch (e) { patients.value = defaultPatients; }
    } else {
      patients.value = defaultPatients;
      savePatients();
    }

    const storedArticles = localStorage.getItem('hes_articles');
    if (storedArticles) {
      try { articles.value = JSON.parse(storedArticles); }
      catch (e) { articles.value = defaultArticles; }
    } else {
      articles.value = defaultArticles;
      saveArticles();
    }

    const storedJobs = localStorage.getItem('hes_jobs');
    if (storedJobs) {
      try { jobs.value = JSON.parse(storedJobs); }
      catch (e) { jobs.value = defaultJobs; }
    } else {
      jobs.value = defaultJobs;
      saveJobs();
    }
  };

  // Run initialization
  initializeStore();

  // --- LocalStorage Helpers ---
  function saveOrgs() {
    localStorage.setItem('hes_organizations', JSON.stringify(organizations.value));
  }

  function saveFacilities() {
    localStorage.setItem('hes_facilities', JSON.stringify(facilities.value));
  }

  function saveStories() {
    localStorage.setItem('hes_stories', JSON.stringify(stories.value));
  }

  function saveDepartments() {
    localStorage.setItem('hes_departments', JSON.stringify(departments.value));
  }

  function saveArticles() {
    localStorage.setItem('hes_articles', JSON.stringify(articles.value));
  }

  function saveJobs() {
    localStorage.setItem('hes_jobs', JSON.stringify(jobs.value));
  }

  function saveStaff() {
    localStorage.setItem('hes_staff', JSON.stringify(staff.value));
  }

  function savePatients() {
    localStorage.setItem('hes_patients', JSON.stringify(patients.value));
  }

  // --- Getters ---
  const orgCount = computed(() => organizations.value.length);
  const facilityCount = computed(() => facilities.value.length);
  const storyCount = computed(() => stories.value.length);
  const approvedStoryCount = computed(() => stories.value.filter(s => s.status === 'Approved').length);
  const pendingStoryCount = computed(() => stories.value.filter(s => s.status === 'Pending').length);
  const fundraisingStoryCount = computed(() => stories.value.filter(s => s.fundraising).length);
  const deptCount = computed(() => departments.value.length);
  const articleCount = computed(() => articles.value.length);
  const publishedArticleCount = computed(() => articles.value.filter(a => a.status === 'published').length);
  const pendingArticleCount = computed(() => articles.value.filter(a => a.status === 'pending_review').length);
  const jobCount = computed(() => jobs.value.length);
  const approvedJobCount = computed(() => jobs.value.filter(j => j.status === 'approved').length);
  const pendingJobCount = computed(() => jobs.value.filter(j => j.status === 'pending').length);

  // --- Toast Actions ---
  function addToast(message, type = 'success') {
    const id = ++toastIdCounter;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  // --- Helper: Date Formatter ---
  function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  // --- Organization CRUD Actions ---
  function addOrg(newOrgData) {
    const currentDate = formatDate(new Date());
    const nextId = organizations.value.length > 0 
      ? Math.max(...organizations.value.map(o => o.id)) + 1 
      : 1;

    const newOrg = {
      id: nextId,
      name: newOrgData.name,
      description: newOrgData.description,
      type: newOrgData.type,
      created: currentDate,
      updated: currentDate
    };

    organizations.value.unshift(newOrg);
    saveOrgs();
    addToast('Organization added successfully', 'success');
  }

  function updateOrg(id, updatedOrgData) {
    const currentDate = formatDate(new Date());
    const index = organizations.value.findIndex(o => o.id === id);
    if (index !== -1) {
      organizations.value[index] = {
        ...organizations.value[index],
        name: updatedOrgData.name,
        description: updatedOrgData.description,
        type: updatedOrgData.type,
        updated: currentDate
      };
      saveOrgs();
      addToast('Organization updated successfully', 'success');
    }
  }

  function deleteOrg(id) {
    const orgToDelete = organizations.value.find(o => o.id === id);
    if (orgToDelete) {
      organizations.value = organizations.value.filter(o => o.id !== id);
      saveOrgs();
      addToast(`Deleted "${orgToDelete.name}"`, 'error');
    }
  }

  // --- Facility CRUD Actions ---
  function addFacility(newFacData) {
    const nextId = facilities.value.length > 0 
      ? Math.max(...facilities.value.map(f => f.id)) + 1 
      : 1;

    const newFacility = {
      id: nextId,
      name: newFacData.name,
      type: newFacData.type,
      organization: newFacData.organization,
      parent: newFacData.parent || '',
      location: newFacData.location || '',
      files: ''
    };

    facilities.value.unshift(newFacility);
    saveFacilities();
    addToast('Facility added successfully', 'success');
  }

  function updateFacility(id, updatedFacData) {
    const index = facilities.value.findIndex(f => f.id === id);
    if (index !== -1) {
      facilities.value[index] = {
        ...facilities.value[index],
        name: updatedFacData.name,
        type: updatedFacData.type,
        organization: updatedFacData.organization,
        parent: updatedFacData.parent || '',
        location: updatedFacData.location || ''
      };
      saveFacilities();
      addToast('Facility updated successfully', 'success');
    }
  }

  function deleteFacility(id) {
    const facToDelete = facilities.value.find(f => f.id === id);
    if (facToDelete) {
      facilities.value = facilities.value.filter(f => f.id !== id);
      saveFacilities();
      addToast(`Deleted "${facToDelete.name}"`, 'error');
    }
  }

  // --- Story CRUD Actions ---
  function addStory(data) {
    const currentDate = formatDate(new Date());
    const nextId = stories.value.length > 0 ? Math.max(...stories.value.map(s => s.id)) + 1 : 1;
    stories.value.unshift({
      id: nextId,
      title: data.title,
      images: 0,
      patient: data.patient,
      status: data.status || 'Pending',
      fundraising: data.fundraising || false,
      raised: data.raised || 0,
      goal: data.goal || 0,
      created: currentDate,
      cover: null
    });
    saveStories();
    addToast('Story added successfully', 'success');
  }

  function updateStory(id, data) {
    const idx = stories.value.findIndex(s => s.id === id);
    if (idx !== -1) {
      stories.value[idx] = { ...stories.value[idx], ...data };
      saveStories();
      addToast('Story updated successfully', 'success');
    }
  }

  function updateStoryStatus(id, status) {
    const idx = stories.value.findIndex(s => s.id === id);
    if (idx !== -1 && stories.value[idx].status !== status) {
      stories.value[idx].status = status;
      saveStories();
      addToast(`Story status changed to ${status}`, 'success');
    }
  }

  function deleteStaff(id) {
    const member = staff.value.find(s => s.id === id);
    if (member) {
      staff.value = staff.value.filter(s => s.id !== id);
      saveStaff();
      addToast(`Deleted "${member.name}"`, 'error');
    }
  }

  function deletePatient(id) {
    const patient = patients.value.find(p => p.id === id);
    if (patient) {
      patients.value = patients.value.filter(p => p.id !== id);
      savePatients();
      addToast(`Deleted "${patient.name}"`, 'error');
    }
  }

  function deleteStory(id) {
    const s = stories.value.find(s => s.id === id);
    if (s) {
      stories.value = stories.value.filter(s => s.id !== id);
      saveStories();
      addToast(`Deleted "${s.title}"`, 'error');
    }
  }

  // --- Department CRUD Actions ---
  function addDept(data) {
    const now = new Date();
    const dateStr = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;
    const nextId = departments.value.length > 0 ? Math.max(...departments.value.map(d => d.id)) + 1 : 1;
    departments.value.unshift({ id: nextId, name: data.name, facility: data.facility, head: data.head, created: dateStr });
    saveDepartments();
    addToast('Department added successfully', 'success');
  }

  function updateDept(id, data) {
    const idx = departments.value.findIndex(d => d.id === id);
    if (idx !== -1) {
      departments.value[idx] = { ...departments.value[idx], ...data };
      saveDepartments();
      addToast('Department updated successfully', 'success');
    }
  }

  function deleteDept(id) {
    const d = departments.value.find(d => d.id === id);
    if (d) {
      departments.value = departments.value.filter(d => d.id !== id);
      saveDepartments();
      addToast(`Deleted "${d.name}"`, 'error');
    }
  }

  // --- Article CRUD Actions ---
  function addArticle(data) {
    const nextId = articles.value.length > 0 ? Math.max(...articles.value.map(a => a.id)) + 1 : 1;
    const isPublished = data.status === 'published';
    articles.value.unshift({
      id: nextId,
      author: data.author,
      title: data.title,
      content: data.content,
      category: data.category,
      status: data.status || 'draft',
      views: 0,
      publish_date: isPublished ? formatDate(new Date()) : null
    });
    saveArticles();
    addToast('Article added successfully', 'success');
  }

  function updateArticle(id, data) {
    const idx = articles.value.findIndex(a => a.id === id);
    if (idx !== -1) {
      const wasPublished = articles.value[idx].status === 'published';
      const isPublished = data.status === 'published';
      
      articles.value[idx] = { 
        ...articles.value[idx], 
        ...data,
        publish_date: (isPublished && !wasPublished) ? formatDate(new Date()) : articles.value[idx].publish_date
      };
      saveArticles();
      addToast('Article updated successfully', 'success');
    }
  }

  function updateArticleStatus(id, status) {
    const idx = articles.value.findIndex(a => a.id === id);
    if (idx !== -1) {
      const wasPublished = articles.value[idx].status === 'published';
      const isPublished = status === 'published';

      articles.value[idx].status = status;
      if (isPublished && !wasPublished) {
        articles.value[idx].publish_date = formatDate(new Date());
      }
      
      saveArticles();
      addToast(`Article status updated to ${status}`, 'success');
    }
  }

  function deleteArticle(id) {
    const a = articles.value.find(a => a.id === id);
    if (a) {
      articles.value = articles.value.filter(a => a.id !== id);
      saveArticles();
      addToast(`Deleted "${a.title}"`, 'error');
    }
  }

  // --- Job CRUD Actions ---
  function addJob(data) {
    const nextId = jobs.value.length > 0 ? Math.max(...jobs.value.map(j => j.id)) + 1 : 1;
    jobs.value.unshift({
      id: nextId,
      facility: data.facility,
      author: data.author,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      created_date: formatDate(new Date()),
      end_date: data.end_date,
      apply_method: data.apply_method,
      apply_value: data.apply_value
    });
    saveJobs();
    addToast('Job post added successfully', 'success');
  }

  function updateJob(id, data) {
    const idx = jobs.value.findIndex(j => j.id === id);
    if (idx !== -1) {
      jobs.value[idx] = { ...jobs.value[idx], ...data };
      saveJobs();
      addToast('Job post updated successfully', 'success');
    }
  }

  function updateJobStatus(id, status) {
    const idx = jobs.value.findIndex(j => j.id === id);
    if (idx !== -1) {
      jobs.value[idx].status = status;
      saveJobs();
      addToast(`Job status updated to ${status}`, 'success');
    }
  }

  function deleteJob(id) {
    const j = jobs.value.find(j => j.id === id);
    if (j) {
      jobs.value = jobs.value.filter(j => j.id !== id);
      saveJobs();
      addToast(`Deleted "${j.title}"`, 'error');
    }
  }

  function updateUserRole(userId, type, roleId) {
    const targetArray = type === 'staff' ? staff : patients;
    const user = targetArray.value.find(u => u.id === userId);
    if (user) {
      user.role_id = roleId;
      if (type === 'staff') saveStaff();
      else savePatients();
      addToast('User role updated successfully', 'success');
    }
  }

  return {
    organizations,
    facilities,
    stories,
    departments,
    articles,
    jobs,
    staff,
    patients,
    toasts,
    userStats,
    orgCount,
    facilityCount,
    storyCount,
    deptCount,
    articleCount,
    publishedArticleCount,
    pendingArticleCount,
    jobCount,
    approvedJobCount,
    pendingJobCount,
    approvedStoryCount,
    pendingStoryCount,
    fundraisingStoryCount,
    addToast,
    removeToast,
    addOrg,
    updateOrg,
    deleteOrg,
    addFacility,
    updateFacility,
    deleteFacility,
    addStory,
    updateStory,
    updateStoryStatus,
    deleteStory,
    deleteStaff,
    deletePatient,
    addDept,
    updateDept,
    deleteDept,
    addArticle,
    updateArticle,
    updateArticleStatus,
    deleteArticle,
    addJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    updateUserRole
  };
});
