import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
  // --- Seed Data definitions ---
  const defaultStories = [
    { id: 1, title_en: 'Help Me Continue Physical Therapy', title_ar: 'ساعدني في مواصلة العلاج الطبيعي', images: 0, patient_en: 'Khalid Abu Amr', patient_ar: 'خالد أبو عمرو', status: 'Pending', fundraising: true, raised: 850, goal: 2000, created: 'Jun 5, 2026', cover: null, content_en: 'I suffered a serious leg injury last year and the doctors advised intensive physical therapy to regain full mobility. We have completed 4 of the 12 required sessions but can no longer afford to continue. Your support will help me walk again and return to my daily life.', content_ar: 'تعرضت لإصابة خطيرة في ساقي العام الماضي ونصح الأطباء بالعلاج الطبيعي المكثف لاستعادة قدرتي الكاملة على الحركة. لقد أكملنا 4 من أصل 12 جلسة مطلوبة ولكننا لم نعد قادرين على تحمل التكاليف. دعمكم سيساعدني على المشي مرة أخرى والعودة إلى حياتي اليومية.', gallery: [] },
    { id: 2, title_en: 'Road to Recovery After Emergency Surgery', title_ar: 'طريق التعافي بعد الجراحة الطارئة', images: 2, patient_en: 'Mohammed Al-Masri', patient_ar: 'محمد المصري', status: 'Approved', fundraising: true, raised: 3200, goal: 5000, created: 'Jun 4, 2026', cover: null, content_en: 'Following an emergency appendectomy, I was left with significant hospital bills and post-operative care costs. The surgery was successful but the road to full recovery requires medication and follow-up visits that we struggle to afford. Every contribution brings me closer to full health.', content_ar: 'بعد عملية استئصال الزائدة الدودية الطارئة، تركت مع فواتير مستشفى كبيرة وتكاليف رعاية ما بعد الجراحة. كانت الجراحة ناجحة ولكن طريق التعافي الكامل يتطلب أدوية وزيارات متابعة نكافح لتحمل تكلفتها. كل مساهمة تقربني من الصحة الكاملة.', gallery: ['gallery-1','gallery-2'] },
    { id: 3, title_en: 'My Journey with Asthma – Breathing Again', title_ar: 'رحلتي مع الربو – التنفس مرة أخرى', images: 1, patient_en: 'Layla Ibrahim', patient_ar: 'ليلى إبراهيم', status: 'Approved', fundraising: false, raised: 0, goal: 0, created: 'Jun 1, 2026', cover: null, content_en: 'I have been living with severe asthma since childhood. The dust and air quality in Gaza has made my condition much worse this year. I wanted to share my story to raise awareness and thank all the healthcare workers who have helped me breathe easier and live a normal life again.', content_ar: 'أعيش مع مرض الربو الحاد منذ الطفولة. الغبار وجودة الهواء في غزة جعلت حالتي أسوأ بكثير هذا العام. أردت مشاركة قصتي لزيادة الوعي وشكر جميع العاملين في الرعاية الصحية الذين ساعدوني على التنفس بسهولة وعيش حياة طبيعية مرة أخرى.', gallery: ['gallery-3'] },
    { id: 4, title_en: 'A New Beginning for My Baby', title_ar: 'بداية جديدة لطفلي', images: 3, patient_en: 'Rania Saleh', patient_ar: 'رانية صالح', status: 'Pending', fundraising: true, raised: 6100, goal: 8000, created: 'May 29, 2026', cover: null, content_en: 'My baby was born premature at 32 weeks. The neonatal team has been incredible. We are raising funds to cover the remaining hospital costs and bring our baby home safely.', content_ar: 'وُلد طفلي قبل الأوان في الأسبوع 32. كان فريق حديثي الولادة رائعًا. نحن نجمع الأموال لتغطية تكاليف المستشفى المتبقية وإحضار طفلنا إلى المنزل بأمان.', gallery: ['gallery-4','gallery-5','gallery-6'] },
    { id: 5, title_en: 'Mental Health Matters – My Story', title_ar: 'الصحة النفسية تهم – قصتي', images: 0, patient_en: 'Amir Zaki', patient_ar: 'أمير زكي', status: 'Rejected', fundraising: false, raised: 0, goal: 0, created: 'May 25, 2026', cover: null, content_en: 'I have been struggling with anxiety and depression for the past two years due to the ongoing conflict. I wanted to share my experience to break the stigma around mental health in our community and encourage others to seek help. Mental health is just as important as physical health.', content_ar: 'كنت أعاني من القلق والاكتئاب خلال العامين الماضيين بسبب النزاع المستمر. أردت مشاركة تجربتي لكسر الوصمة المحيطة بالصحة النفسية في مجتمعنا وتشجيع الآخرين على طلب المساعدة. الصحة النفسية لا تقل أهمية عن الصحة البدنية.', gallery: [] }
  ];

  const defaultStaff = [
    { id: 1, name_en: 'Dr. Ahmed Hassan', name_ar: 'د. أحمد حسن', email: 'ahmed.hassan@health.ps', specialization_en: 'Emergency Medicine', specialization_ar: 'طب الطوارئ', experience: 12, fee: 50, provider: 'Local', lastSeen: 'about 5 hours ago', status: 'Online', role_id: 3, profile: { phone: '+970 59-123-4567', gender: 'Male', birthDate: '1985-05-15', address_en: 'Remal District, Gaza City', address_ar: 'حي الرمال، مدينة غزة', coverImage: null } },
    { id: 2, name_en: 'Dr. Fatima Al-Zahroa', name_ar: 'د. فاطمة الزهراء', email: 'fatima.zahroa@gmail.com', specialization_en: 'Pediatrics', specialization_ar: 'طب الأطفال', experience: 8, fee: 40, provider: 'Google', lastSeen: 'about 12 hours ago', status: 'Online' },
    { id: 3, name_en: 'Dr. Omar Khalil', name_ar: 'د. عمر خليل', email: 'omar.khalil@health.ps', specialization_en: 'General Surgery', specialization_ar: 'الجراحة العامة', experience: 15, fee: 60, provider: 'Local', lastSeen: '2 days ago', status: 'Offline' },
    { id: 4, name_en: 'Dr. Youssef Nasser', name_ar: 'د. يوسف ناصر', email: 'youssef.nasser@health.ps', specialization_en: 'Internal Medicine', specialization_ar: 'الطب الباطني', experience: 10, fee: 45, provider: 'Local', lastSeen: '3 days ago', status: 'Offline' },
    { id: 5, name_en: 'Dr. Samira Hamed', name_ar: 'د. سميرة حامد', email: 'samira.hamed@gmail.com', specialization_en: 'Obstetrics & Gynecology', specialization_ar: 'طب النساء والولادة', experience: 9, fee: 55, provider: 'Google', lastSeen: '5 days ago', status: 'Offline' }
  ];

  const defaultPatients = [
    { id: 1, name_en: 'Khalid Abu Amr', name_ar: 'خالد أبو عمرو', email: 'khalid.abuamr@gmail.com', provider: 'Google', lastSeen: 'about 6 hours ago', joined: 'May 17, 2026', status: 'Online' },
    { id: 2, name_en: 'Mohammed Al-Masri', name_ar: 'محمد المصري', email: 'mohammed.masri@health.ps', provider: 'Local', lastSeen: 'about 8 hours ago', joined: 'May 18, 2026', status: 'Online' },
    { id: 3, name_en: 'Layla Ibrahim', name_ar: 'ليلى إبراهيم', email: 'layla.ibrahim@gmail.com', provider: 'Google', lastSeen: '2 days ago', joined: 'May 22, 2026', status: 'Offline' },
    { id: 4, name_en: 'Rania Saleh', name_ar: 'رانية صالح', email: 'rania.saleh@gmail.com', provider: 'Google', lastSeen: '3 days ago', joined: 'May 25, 2026', status: 'Offline' },
    { id: 5, name_en: 'Amir Zaki', name_ar: 'أمير زكي', email: 'amir.zaki@health.ps', provider: 'Local', lastSeen: '5 days ago', joined: 'May 28, 2026', status: 'Offline' }
  ];

  const defaultDepartments = [
    { id: 1, name_en: 'Internal Medicine', name_ar: 'الطب الباطني', facility: 'Al-Awda Clinic Jabalia', head_en: 'Dr. Youssef Nasser', head_ar: 'د. يوسف ناصر', created: '6/4/2026' },
    { id: 2, name_en: 'Surgery Department', name_ar: 'قسم الجراحة', facility: 'European Gaza Hospital', head_en: 'Dr. Omar Khalil', head_ar: 'د. عمر خليل', created: '5/31/2026' },
    { id: 3, name_en: 'Pediatrics Ward', name_ar: 'جناح الأطفال', facility: 'Kamal Adwan Hospital', head_en: 'Dr. Fatima Al-Zahroa', head_ar: 'د. فاطمة الزهراء', created: '5/29/2026' },
    { id: 4, name_en: 'Emergency Unit', name_ar: 'وحدة الطوارئ', facility: 'Al-Shifa Medical Complex', head_en: 'Dr. Ahmed Hassan', head_ar: 'د. أحمد حسن', created: '5/27/2026' }
  ];

  const defaultArticles = [
    { id: 1, author: 'Dr. Ahmed Hassan', title_en: 'Managing Emergency Scenarios in Crisis Zones', title_ar: 'إدارة سيناريوهات الطوارئ في مناطق الأزمات', content_en: 'In crisis zones, emergency medical management requires a unique set of skills and rapid decision-making...', content_ar: 'في مناطق الأزمات، تتطلب إدارة الطوارئ الطبية مجموعة فريدة من المهارات واتخاذ قرارات سريعة...', category_en: 'Medical', category_ar: 'طبية', status: 'published', views: 1240, publish_date: 'Jun 1, 2026', tags: [1, 4] },
    { id: 2, author: 'Dr. Fatima Al-Zahroa', title_en: 'Pediatric Care During Displacement', title_ar: 'رعاية الأطفال أثناء النزوح', content_en: 'Displacement presents significant challenges for pediatric healthcare, including lack of nutrition and clean water...', content_ar: 'يمثل النزوح تحديات كبيرة لرعاية الأطفال الصحية، بما في ذلك نقص التغذية والمياه النظيفة...', category_en: 'Pediatrics', category_ar: 'طب الأطفال', status: 'published', views: 850, publish_date: 'Jun 3, 2026', tags: [3, 4] },
    { id: 3, author: 'Dr. Omar Khalil', title_en: 'Advanced Surgical Techniques for Trauma', title_ar: 'تقنيات جراحية متقدمة للصدمات', content_en: 'Trauma surgery in resource-limited settings demands innovation and strict adherence to core principles...', content_ar: 'تتطلب جراحة الصدمات في البيئات محدودة الموارد الابتكار والالتزام الصارم بالمبادئ الأساسية...', category_en: 'Surgery', category_ar: 'جراحة', status: 'pending_review', views: 0, publish_date: null, tags: [1, 6] },
    { id: 4, author: 'Staff Writer', title_en: 'Building Resilient Health Systems', title_ar: 'بناء أنظمة صحية مرنة', content_en: 'Resilience in health systems is built through community engagement and robust infrastructure...', content_ar: 'تُبنى المرونة في الأنظمة الصحية من خلال المشاركة المجتمعية والبنية التحتية القوية...', category_en: 'Health Policy', category_ar: 'السياسة الصحية', status: 'draft', views: 0, publish_date: null, tags: [4, 5] },
    { id: 5, author: 'Dr. Samira Hamed', title_en: 'Maternal Health in Conflict Zones', title_ar: 'صحة الأم في مناطق الصراع', content_en: 'Conflict zones significantly impact maternal health outcomes. This article explores strategies for improvement...', content_ar: 'تؤثر مناطق الصراع بشكل كبير على نتائج صحة الأم. يستعرض هذا المقال استراتيجيات التحسين...', category_en: 'Obstetrics', category_ar: 'طب التوليد', status: 'archived', views: 520, publish_date: 'May 15, 2026', tags: [4, 6] }
  ];

  const defaultJobs = [
    { id: 1, facility: 'Al-Awda Clinic Jabalia', author: 'Dr. Ahmed Hassan', title_en: 'Emergency Registered Nurse', title_ar: 'ممرض مسجل طوارئ', description_en: 'We are looking for a dedicated Registered Nurse to join our emergency medical team in Jabalia. Experience in trauma care is highly preferred.', description_ar: 'نحن نبحث عن ممرض مسجل مخصص للانضمام إلى فريقنا الطبي للطوارئ في جباليا. يفضل بشدة الخبرة في رعاية الصدمات.', status: 'approved', created_date: 'Jun 1, 2026', end_date: 'Jul 1, 2026', apply_method: 'email', apply_value: 'hr@alawda.org' },
    { id: 2, facility: 'European Gaza Hospital', author: 'Staff Writer', title_en: 'Pediatric Specialist', title_ar: 'أخصائي أطفال', description_en: 'Seeking an experienced Pediatric Specialist for full-time duty at the European Gaza Hospital. Must be board certified.', description_ar: 'البحث عن أخصائي أطفال ذو خبرة للعمل بدوام كامل في مستشفى غزة الأوروبي. يجب أن يكون حاصلاً على شهادة البورد.', status: 'approved', created_date: 'Jun 3, 2026', end_date: 'Jul 15, 2026', apply_method: 'link', apply_value: 'https://careers.egh.ps/apply/pediatrics' },
    { id: 3, facility: 'Kamal Adwan Hospital', author: 'Dr. Fatima Al-Zahroa', title_en: 'Pharmacy Technician', title_ar: 'فني صيدلة', description_en: 'Kamal Adwan Hospital is hiring a Pharmacy Technician to assist in medication dispensing and inventory management.', description_ar: 'يستأجر مستشفى كمال عدوان فني صيدلة للمساعدة في صرف الأدوية وإدارة المخزون.', status: 'pending', created_date: 'Jun 5, 2026', end_date: 'Jun 30, 2026', apply_method: 'email', apply_value: 'jobs@kamaladwan.ps' },
    { id: 4, facility: 'Al-Shifa Medical Complex', author: 'Dr. Ahmed Hassan', title_en: 'Senior Trauma Surgeon', title_ar: 'جراح صدمات أول', description_en: 'Lead surgeon position available for our trauma unit. Minimum 10 years of surgical experience required.', description_ar: 'وظيفة جراح رئيسي متاحة لوحدة الصدمات لدينا. مطلوب خبرة جراحية لا تقل عن 10 سنوات.', status: 'pending', created_date: 'Jun 6, 2026', end_date: 'Aug 1, 2026', apply_method: 'link', apply_value: 'https://alshifa.ps/jobs/trauma-surgeon' }
  ];

  // --- States ---
  const organizations = ref([]);
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

  // --- Story CRUD Actions ---
  function addStory(data) {
    const currentDate = formatDate(new Date());
    const nextId = stories.value.length > 0 ? Math.max(...stories.value.map(s => s.id)) + 1 : 1;
    stories.value.unshift({
      id: nextId,
      title_en: data.title_en,
      title_ar: data.title_ar,
      images: 0,
      patient_en: data.patient_en,
      patient_ar: data.patient_ar,
      content_en: data.content_en,
      content_ar: data.content_ar,
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
      addToast(`Deleted "${member.name_en}"`, 'error');
    }
  }

  function deletePatient(id) {
    const patient = patients.value.find(p => p.id === id);
    if (patient) {
      patients.value = patients.value.filter(p => p.id !== id);
      savePatients();
      addToast(`Deleted "${patient.name_en}"`, 'error');
    }
  }

  function deleteStory(id) {
    const s = stories.value.find(s => s.id === id);
    if (s) {
      stories.value = stories.value.filter(s => s.id !== id);
      saveStories();
      addToast(`Deleted "${s.title_en}"`, 'error');
    }
  }

  // --- Department CRUD Actions ---
  function addDept(data) {
    const now = new Date();
    const dateStr = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;
    const nextId = departments.value.length > 0 ? Math.max(...departments.value.map(d => d.id)) + 1 : 1;
    departments.value.unshift({ 
      id: nextId, 
      name_en: data.name_en, 
      name_ar: data.name_ar, 
      facility: data.facility, 
      head_en: data.head_en, 
      head_ar: data.head_ar, 
      created: dateStr 
    });
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
      addToast(`Deleted "${d.name_en}"`, 'error');
    }
  }

  // --- Article CRUD Actions ---
  function addArticle(data) {
    const nextId = articles.value.length > 0 ? Math.max(...articles.value.map(a => a.id)) + 1 : 1;
    const isPublished = data.status === 'published';
    articles.value.unshift({
      id: nextId,
      author: data.author,
      title_en: data.title_en,
      title_ar: data.title_ar,
      content_en: data.content_en,
      content_ar: data.content_ar,
      category_en: data.category_en,
      category_ar: data.category_ar,
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
      addToast(`Deleted "${a.title_en}"`, 'error');
    }
  }

  // --- Job CRUD Actions ---
  function addJob(data) {
    const nextId = jobs.value.length > 0 ? Math.max(...jobs.value.map(j => j.id)) + 1 : 1;
    jobs.value.unshift({
      id: nextId,
      facility: data.facility,
      author: data.author,
      title_en: data.title_en,
      title_ar: data.title_ar,
      description_en: data.description_en,
      description_ar: data.description_ar,
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
      addToast(`Deleted "${j.title_en}"`, 'error');
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
    stories,
    departments,
    articles,
    jobs,
    staff,
    patients,
    toasts,
    userStats,
    orgCount,
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
