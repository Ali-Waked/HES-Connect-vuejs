import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const today = new Date().toISOString().slice(0, 10);
const dayMs = 86400000;
const dateFromNow = (days) => new Date(Date.now() + days * dayMs).toISOString().slice(0, 10);
const nextId = (items) => (items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1);

const names_en = [
  'Mariam Al-Haddad', 'Khaled Abu Amr', 'Layla Nasser', 'Yousef Barakat', 'Rania Saleh',
  'Omar Al-Khalil', 'Noor Mansour', 'Hassan Al-Masri', 'Alaa Shurrab', 'Samar Abu Nada',
  'Tariq Al-Najjar', 'Dina Al-Qedra', 'Mahmoud Hijazi', 'Hiba Al-Sayed', 'Anas Zaqout',
  'Reem Ashour', 'Ibrahim Abu Taha', 'Salma Al-Banna', 'Fadi Al-Ghoul', 'Nour Al-Din'
];

const names_ar = [
  'مريم الحداد', 'خالد أبو عمرو', 'ليلى ناصر', 'يوسف بركات', 'رانية صالح',
  'عمر الخليل', 'نور منصور', 'حسن المصري', 'آلاء شراب', 'سمر أبو ندى',
  'طارق النجار', 'دينا القدرة', 'محمود حجازي', 'هبة السيد', 'أنس زقوت',
  'ريم عاشور', 'إبراهيم أبو طه', 'سلمى البنا', 'فادي الغول', 'نور الدين'
];

export const useStaffStore = defineStore('staff', () => {
  const currentUser = ref({
    id: 1,
    name_en: 'Dr. Ahmed Al-Masri',
    name_ar: 'د. أحمد المصري',
    email: 'ahmed@health.ps',
    role: 'doctor',
    specialization_en: 'Cardiology',
    specialization_ar: 'طب القلب',
    experience: 8,
    fee: 50,
    facilityId: 1,
    avatar: null,
    phone: '+970 59 222 4411',
    gender: 'male',
    birthDate: '1986-04-12',
    address_en: 'Al-Rimal, Gaza City',
    address_ar: 'الرمال، مدينة غزة',
    bio_en: 'Cardiologist focused on practical care for chronic heart conditions.',
    bio_ar: 'أخصائي قلب يركز على الرعاية العملية لحالات القلب المزمنة.'
  });

  const appointments = ref(Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    patientName_en: names_en[index],
    patientName_ar: names_ar[index],
    patientAvatar: null,
    doctorName_en: index % 3 === 0 ? 'Dr. Ahmed Al-Masri' : index % 3 === 1 ? 'Dr. Hala Abu Rayan' : 'Dr. Samer Al-Khatib',
    doctorName_ar: index % 3 === 0 ? 'د. أحمد المصري' : index % 3 === 1 ? 'د. هالة أبو ريان' : 'د. سامر الخطيب',
    date: index < 6 ? today : dateFromNow((index % 10) - 3),
    time: `${String(8 + (index % 9)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`,
    facilityName_en: index % 2 ? 'Al-Shifa Medical Complex' : 'European Gaza Hospital',
    facilityName_ar: index % 2 ? 'مجمع الشفاء الطبي' : 'مستشفى غزة الأوروبي',
    status: ['booked', 'completed', 'cancelled', 'rescheduled'][index % 4],
    notes_en: index % 2 ? 'Follow-up consultation and vital signs review.' : 'Initial assessment with patient history.',
    notes_ar: index % 2 ? 'استشارة متابعة ومراجعة العلامات الحيوية.' : 'تقييم أولي مع تاريخ المريض.'
  })));

  const patients = ref(Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    name_en: names_en[index],
    name_ar: names_ar[index],
    email: `${names_en[index].toLowerCase().replaceAll(' ', '.')}@mail.ps`,
    phone: `+970 59 ${String(1000000 + index * 37391).slice(0, 7)}`,
    gender: index % 2 ? 'female' : 'male',
    birthDate: `${1978 + (index % 24)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    medicalHistory_en: ['Hypertension', 'Diabetes type 2', 'Asthma', 'No chronic illness'][index % 4],
    medicalHistory_ar: ['ارتفاع ضغط الدم', 'السكري من النوع 2', 'الربو', 'لا يوجد مرض مزمن'][index % 4],
    lastVisit: dateFromNow(-index - 1),
    totalAppointments: 2 + (index % 8)
  })));

  const prescriptions = ref(Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    patientName_en: names_en[index],
    patientName_ar: names_ar[index],
    appointmentDate: dateFromNow(-index),
    medicines: [
      { 
        name_en: ['Paracetamol', 'Amoxicillin', 'Aspirin'][index % 3], 
        name_ar: ['باراسيتامول', 'أموكسيسيلين', 'أسبرين'][index % 3], 
        dosage_en: '1 tablet twice daily', 
        dosage_ar: 'قرص واحد مرتين يوميًا', 
        duration_en: '5 days',
        duration_ar: '5 أيام'
      },
      { 
        name_en: ['Omeprazole', 'Salbutamol', 'Vitamin D'][index % 3], 
        name_ar: ['أوميبرازول', 'سالبوتامول', 'فيتامين د'][index % 3], 
        dosage_en: '1 dose daily', 
        dosage_ar: 'جرعة واحدة يوميًا', 
        duration_en: '10 days',
        duration_ar: '10 أيام'
      }
    ]
  })));

  const schedule = ref([
    { id: 1, dayOfWeek: 0, dayName_en: 'Sunday', dayName_ar: 'الأحد', startTime: '09:00', endTime: '13:00', slotDuration: 30 },
    { id: 2, dayOfWeek: 1, dayName_en: 'Monday', dayName_ar: 'الإثنين', startTime: '10:00', endTime: '14:00', slotDuration: 30 },
    { id: 3, dayOfWeek: 2, dayName_en: 'Tuesday', dayName_ar: 'الثلاثاء', startTime: '09:00', endTime: '12:00', slotDuration: 20 },
    { id: 4, dayOfWeek: 3, dayName_en: 'Wednesday', dayName_ar: 'الأربعاء', startTime: '11:00', endTime: '15:00', slotDuration: 30 },
    { id: 5, dayOfWeek: 4, dayName_en: 'Thursday', dayName_ar: 'الخميس', startTime: '08:30', endTime: '12:30', slotDuration: 30 }
  ]);

  const unavailableDates = ref([
    { id: 1, date: dateFromNow(2), reason_en: 'Hospital committee meeting', reason_ar: 'اجتماع لجنة المستشفى' },
    { id: 2, date: dateFromNow(5), reason_en: 'Training workshop', reason_ar: 'ورشة عمل تدريبية' },
    { id: 3, date: dateFromNow(9), reason_en: 'Conference duty', reason_ar: 'مهمة مؤتمر' },
    { id: 4, date: dateFromNow(14), reason_en: 'Personal leave', reason_ar: 'إجازة شخصية' },
    { id: 5, date: dateFromNow(19), reason_en: 'Facility audit', reason_ar: 'تدقيق المنشأة' }
  ]);

  const reviews = ref(Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    patientName_en: names_en[index],
    patientName_ar: names_ar[index],
    rating: [5, 4, 5, 4, 3, 5][index % 6],
    comment_en: ['Clear explanation and kind follow-up.', 'Professional and punctual.', 'Helpful care plan.', 'Good consultation experience.'][index % 4],
    comment_ar: ['شرح واضح ومتابعة لطيفة.', 'احترافي ومنضبط.', 'خطة رعاية مفيدة.', 'تجربة استشارة جيدة.'][index % 4],
    date: dateFromNow(-index - 1),
    appointmentDate: dateFromNow(-index - 4)
  })));

  const articles = ref(Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    title_en: ['Heart Health During Stress', 'Managing Diabetes Safely', 'Asthma Action Plans', 'Medication Safety', 'Nutrition for Recovery', 'Emergency Warning Signs'][index],
    title_ar: ['صحة القلب أثناء التوتر', 'إدارة السكري بأمان', 'خطط عمل الربو', 'سلامة الأدوية', 'التغذية من أجل التعافي', 'علامات التحذير الطارئة'][index],
    category_en: ['Cardiology', 'Diabetes', 'Pulmonology', 'Pharmacy', 'Nutrition', 'Emergency'][index],
    category_ar: ['طب القلب', 'السكري', 'طب الرئة', 'الصيدلة', 'التغذية', 'الطوارئ'][index],
    status: ['published', 'draft', 'pending_review'][index % 3],
    views: 220 + index * 137,
    tags: ['health', 'gaza'],
    date: dateFromNow(-index * 3),
    author_en: currentUser.value.name_en,
    author_ar: currentUser.value.name_ar
  })));

  const inventory = ref(Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    medicineName_en: ['Paracetamol', 'Amoxicillin', 'Aspirin', 'Insulin', 'Salbutamol', 'Omeprazole', 'Cetirizine', 'Metformin', 'Atorvastatin', 'Cefixime'][index % 10] + ` ${index + 1}`,
    medicineName_ar: ['باراسيتامول', 'أموكسيسيلين', 'أسبرين', 'أنسولين', 'سالبوتامول', 'أوميبرازول', 'سيتيريزين', 'ميتفورمين', 'أتورفاستاتين', 'سيفيكسيم'][index % 10] + ` ${index + 1}`,
    description_en: 'Essential medicine used across facility pharmacy workflows.',
    description_ar: 'دواء أساسي يستخدم في سير عمل صيدلية المنشأة.',
    quantity: [4, 8, 12, 18, 25, 31, 7, 14, 22, 40][index % 10],
    price: Number((2.5 + index * 0.75).toFixed(2))
  })));

  const medicationRequests = ref(Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    patientName_en: names_en[index],
    patientName_ar: names_ar[index],
    prescriptionId: index + 1,
    medicines: [
      { name_en: 'Paracetamol 1', name_ar: 'باراسيتامول 1', dosage_en: '500mg twice daily', dosage_ar: '500 ملغ مرتين يوميًا', duration_en: '5 days', duration_ar: '5 أيام' },
      { name_en: 'Amoxicillin 2', name_ar: 'أموكسيسيلين 2', dosage_en: '250mg three times daily', dosage_ar: '250 ملغ ثلاث مرات يوميًا', duration_en: '7 days', duration_ar: '7 أيام' }
    ],
    status: ['pending', 'approved', 'rejected', 'pending'][index % 4],
    date: dateFromNow(-index)
  })));

  const departments = ref([
    { id: 1, name_en: 'Cardiology', name_ar: 'طب القلب', headDoctor_en: 'Dr. Ahmed Al-Masri', headDoctor_ar: 'د. أحمد المصري', staffCount: 8 },
    { id: 2, name_en: 'Emergency', name_ar: 'الطوارئ', headDoctor_en: 'Dr. Samer Al-Khatib', headDoctor_ar: 'د. سامر الخطيب', staffCount: 14 },
    { id: 3, name_en: 'Pediatrics', name_ar: 'طب الأطفال', headDoctor_en: 'Dr. Hala Abu Rayan', headDoctor_ar: 'د. هالة أبو ريان', staffCount: 9 },
    { id: 4, name_en: 'Pharmacy', name_ar: 'الصيدلة', headDoctor_en: 'Ph. Rami Al-Najjar', headDoctor_ar: 'ص. رامي النجار', staffCount: 6 },
    { id: 5, name_en: 'Internal Medicine', name_ar: 'الطب الباطني', headDoctor_en: 'Dr. Mona Shurrab', headDoctor_ar: 'د. منى شراب', staffCount: 11 }
  ]);

  const facilityStaff = ref(Array.from({ length: 12 }, (_, index) => {
    const roles = [
      { slug: 'doctor', name_en: 'Doctor', name_ar: 'طبيب' },
      { slug: 'doctor', name_en: 'Doctor', name_ar: 'طبيب' },
      { slug: 'doctor', name_en: 'Doctor', name_ar: 'طبيب' },
      { slug: 'nurse', name_en: 'Nurse', name_ar: 'ممرض' },
      { slug: 'nurse', name_en: 'Nurse', name_ar: 'ممرض' },
      { slug: 'pharmacist', name_en: 'Pharmacist', name_ar: 'صيدلي' },
      { slug: 'receptionist', name_en: 'Receptionist', name_ar: 'موظف استقبال' },
      { slug: 'doctor', name_en: 'Doctor', name_ar: 'طبيب' },
      { slug: 'nurse', name_en: 'Nurse', name_ar: 'ممرض' },
      { slug: 'pharmacist', name_en: 'Pharmacist', name_ar: 'صيدلي' },
      { slug: 'doctor', name_en: 'Doctor', name_ar: 'طبيب' },
      { slug: 'receptionist', name_en: 'Receptionist', name_ar: 'موظف استقبال' },
    ]
    return {
      id: index + 1,
      name_en: ['Dr. Ahmed Al-Masri', 'Dr. Hala Abu Rayan', 'Dr. Samer Al-Khatib', 'Nurse Lina Barakat', 'Nurse Omar Hijazi', 'Ph. Rami Al-Najjar', 'Recep. Sara Khalil', 'Dr. Mahmoud Hijazi', 'Nurse Hiba Al-Sayed', 'Ph. Anas Zaqout', 'Dr. Reem Ashour', 'Recep. Fadi Al-Ghoul'][index],
      name_ar: ['د. أحمد المصري', 'د. هالة أبو ريان', 'د. سامر الخطيب', 'الممرضة لينا بركات', 'الممرض عمر حجازي', 'ص. رامي النجار', 'موظفة الاستقبال سارة خليل', 'د. محمود حجازي', 'الممرضة هبة السيد', 'ص. أنس زقوت', 'د. ريم عاشور', 'موظف الاستقبال فادي الغول'][index],
      specialization_en: ['Cardiology', 'Pediatrics', 'Emergency', 'Nursing', 'Nursing', 'Pharmacy', 'Admin', 'Internal Medicine', 'Nursing', 'Pharmacy', 'Pediatrics', 'Admin'][index],
      specialization_ar: ['طب القلب', 'طب الأطفال', 'الطوارئ', 'التمريض', 'التمريض', 'الصيدلة', 'إداري', 'طب باطني', 'التمريض', 'الصيدلة', 'طب الأطفال', 'إداري'][index],
      department_en: departments.value[index % departments.value.length].name_en,
      department_ar: departments.value[index % departments.value.length].name_ar,
      role: roles[index],
      experience: 2 + (index % 12),
      email: `staff${index + 1}@health.ps`
    }
  }));

  const jobPosts = ref(Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    title_en: ['Emergency Nurse', 'Pharmacy Assistant', 'Lab Technician', 'Pediatric Doctor', 'Reception Officer', 'Data Clerk'][index],
    title_ar: ['ممرض طوارئ', 'مساعد صيدلي', 'فني مختبر', 'طبيب أطفال', 'موظف استقبال', 'كاتب بيانات'][index],
    description_en: 'Healthcare facility vacancy for an experienced professional.',
    description_ar: 'وظيفة شاغرة في منشأة رعاية صحية لمهني ذو خبرة.',
    applyMethod: index % 2 ? 'link' : 'email',
    applyValue: index % 2 ? 'https://health.ps/jobs/apply' : 'jobs@health.ps',
    endDate: dateFromNow(4 + index * 5),
    status: index % 2 ? 'approved' : 'pending',
    category_en: ['Clinical', 'Pharmacy', 'Laboratory', 'Clinical', 'Admin', 'Admin'][index],
    category_ar: ['سريري', 'صيدلة', 'مختبر', 'سريري', 'إداري', 'إداري'][index]
  })));

  const documents = ref(Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    documentType_en: ['License Renewal', 'Facility Certificate', 'Staff Credential', 'Safety Report'][index % 4],
    documentType_ar: ['تجديد الترخيص', 'شهادة المنشأة', 'اعتماد الموظفين', 'تقرير السلامة'][index % 4],
    status: ['pending', 'approved', 'rejected'][index % 3],
    fileUrl: `document-${index + 1}.pdf`,
    uploadDate: dateFromNow(-index * 2)
  })));

  const conversations = ref(Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    participantName_en: names_en[index + 5],
    participantName_ar: names_ar[index + 5],
    participantRole_en: ['Patient', 'Nurse', 'Manager', 'Pharmacist', 'Doctor'][index],
    participantRole_ar: ['مريض', 'ممرض', 'مدير', 'صيدلي', 'طبيب'][index],
    lastMessage_en: ['Can you confirm the appointment?', 'The report is ready.', 'Please review this request.', 'Medicine stock updated.', 'Thank you doctor.'][index],
    lastMessage_ar: ['هل يمكنك تأكيد الموعد؟', 'التقرير جاهز.', 'يرجى مراجعة هذا الطلب.', 'تم تحديث مخزون الدواء.', 'شكرًا دكتور.'][index],
    lastTime: `${9 + index}:1${index}`,
    unreadCount: index % 3,
    messages: [
      { id: 1, senderId: 99, text: 'Hello, I need help with my appointment.', time: '09:00', isMe: false },
      { id: 2, senderId: currentUser.value.id, text: 'I can help. Please share the details.', time: '09:05', isMe: true }
    ]
  })));

  const announcements = ref([
    { id: 1, title_en: 'Clinic hours updated', title_ar: 'تحديث ساعات العيادة', content_en: 'Morning clinic starts at 8:30 AM this week.', content_ar: 'تبدأ العيادة الصباحية في الساعة 8:30 صباحًا هذا الأسبوع.', isActive: true, date: today },
    { id: 2, title_en: 'Medication audit', title_ar: 'تدقيق الأدوية', content_en: 'Pharmacy inventory audit scheduled for Thursday.', content_ar: 'من المقرر إجراء تدقيق لمخزون الصيدلية يوم الخميس.', isActive: true, date: dateFromNow(1) },
    { id: 3, title_en: 'Training session', title_ar: 'جلسة تدريبية', content_en: 'Patient safety training available for all staff.', content_ar: 'تدريب سلامة المرضى متاح لجميع الموظفين.', isActive: false, date: dateFromNow(3) }
  ]);

  const toasts = ref([]);
  let toastId = 0;

  const todayAppointments = computed(() => appointments.value.filter((item) => item.date === today));
  const bookedAppointments = computed(() => appointments.value.filter((item) => item.status === 'booked'));
  const completedAppointments = computed(() => appointments.value.filter((item) => item.status === 'completed'));
  const avgRating = computed(() => reviews.value.length ? reviews.value.reduce((sum, item) => sum + item.rating, 0) / reviews.value.length : 0);
  const totalUnread = computed(() => conversations.value.reduce((sum, item) => sum + item.unreadCount, 0));
  const lowStockItems = computed(() => inventory.value.filter((item) => item.quantity < 10));
  const pendingRequests = computed(() => medicationRequests.value.filter((item) => item.status === 'pending'));

  function showToast(message, type = 'success') {
    const id = ++toastId;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }, type === 'error' ? 4000 : 3000);
  }

  function updateAppointmentStatus(id, status) {
    const item = appointments.value.find((appointment) => appointment.id === id);
    if (item) item.status = status;
  }

  function addPrescription(prescription) {
    prescriptions.value.unshift({ 
      id: nextId(prescriptions.value), 
      patientName_en: prescription.patientName_en,
      patientName_ar: prescription.patientName_ar,
      appointmentDate: prescription.appointmentDate,
      medicines: prescription.medicines.map(m => ({
        name_en: m.name_en,
        name_ar: m.name_ar,
        dosage_en: m.dosage_en,
        dosage_ar: m.dosage_ar,
        duration_en: m.duration_en,
        duration_ar: m.duration_ar
      }))
    });
  }

  function addScheduleSlot(slot) {
    schedule.value.push({ 
      id: nextId(schedule.value), 
      dayName_en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek], 
      dayName_ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][slot.dayOfWeek], 
      ...slot 
    });
  }

  function deleteScheduleSlot(id) {
    schedule.value = schedule.value.filter((item) => item.id !== id);
  }

  function addUnavailableDate(entry) {
    unavailableDates.value.unshift({ 
      id: nextId(unavailableDates.value), 
      date: entry.date,
      reason_en: entry.reason_en,
      reason_ar: entry.reason_ar
    });
  }

  function deleteUnavailableDate(id) {
    unavailableDates.value = unavailableDates.value.filter((item) => item.id !== id);
  }

  function addInventoryItem(item) {
    inventory.value.unshift({ 
      id: nextId(inventory.value), 
      medicineName_en: item.medicineName_en,
      medicineName_ar: item.medicineName_ar,
      description_en: item.description_en,
      description_ar: item.description_ar,
      quantity: item.quantity,
      price: item.price
    });
  }

  function updateInventoryItem(id, data) {
    const item = inventory.value.find((row) => row.id === id);
    if (item) Object.assign(item, data);
  }

  function deleteInventoryItem(id) {
    inventory.value = inventory.value.filter((item) => item.id !== id);
  }

  function approveRequest(id) {
    const request = medicationRequests.value.find((item) => item.id === id);
    if (!request) return;
    request.status = 'approved';
    request.medicines.forEach((medicine) => {
      const stock = inventory.value.find((item) => item.medicineName_en === medicine.name_en);
      if (stock) stock.quantity = Math.max(0, stock.quantity - 1);
    });
  }

  function rejectRequest(id) {
    const request = medicationRequests.value.find((item) => item.id === id);
    if (request) request.status = 'rejected';
  }

  function addDepartment(dept) {
    departments.value.unshift({ 
      id: nextId(departments.value), 
      staffCount: 0, 
      name_en: dept.name_en,
      name_ar: dept.name_ar,
      headDoctor_en: dept.headDoctor_en,
      headDoctor_ar: dept.headDoctor_ar
    });
  }

  function updateDepartment(id, data) {
    const item = departments.value.find((dept) => dept.id === id);
    if (item) Object.assign(item, data);
  }

  function deleteDepartment(id) {
    departments.value = departments.value.filter((item) => item.id !== id);
  }

  function addJobPost(post) {
    jobPosts.value.unshift({ 
      id: nextId(jobPosts.value), 
      status: 'pending', 
      title_en: post.title_en,
      title_ar: post.title_ar,
      description_en: post.description_en,
      description_ar: post.description_ar,
      category_en: post.category_en,
      category_ar: post.category_ar,
      applyMethod: post.applyMethod,
      applyValue: post.applyValue,
      endDate: post.endDate
    });
  }

  function updateJobPost(id, data) {
    const item = jobPosts.value.find((post) => post.id === id);
    if (item) Object.assign(item, data);
  }

  function deleteJobPost(id) {
    jobPosts.value = jobPosts.value.filter((item) => item.id !== id);
  }

  function addDocument(document) {
    documents.value.unshift({ 
      id: nextId(documents.value), 
      status: 'pending', 
      uploadDate: today, 
      documentType_en: document.documentType_en,
      documentType_ar: document.documentType_ar,
      fileUrl: document.fileUrl
    });
  }

  function sendMessage(conversationId, text_en, text_ar) {
    const conversation = conversations.value.find((item) => item.id === conversationId);
    if (!conversation) return;
    const msg_en = text_en?.trim();
    const msg_ar = text_ar?.trim();
    if (!msg_en && !msg_ar) return;

    conversation.messages.push({ 
      id: nextId(conversation.messages), 
      senderId: currentUser.value.id, 
      text_en: msg_en, 
      text_ar: msg_ar, 
      time: new Date().toTimeString().slice(0, 5), 
      isMe: true 
    });
    conversation.lastMessage_en = msg_en;
    conversation.lastMessage_ar = msg_ar;
    conversation.lastTime = 'Now';
  }

  function updateProfile(data) {
    currentUser.value = { ...currentUser.value, ...data };
  }

  return {
    currentUser,
    appointments,
    patients,
    prescriptions,
    schedule,
    unavailableDates,
    reviews,
    articles,
    inventory,
    medicationRequests,
    departments,
    facilityStaff,
    jobPosts,
    documents,
    conversations,
    announcements,
    toasts,
    todayAppointments,
    bookedAppointments,
    completedAppointments,
    avgRating,
    totalUnread,
    lowStockItems,
    pendingRequests,
    showToast,
    updateAppointmentStatus,
    addPrescription,
    addScheduleSlot,
    deleteScheduleSlot,
    addUnavailableDate,
    deleteUnavailableDate,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    approveRequest,
    rejectRequest,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addJobPost,
    updateJobPost,
    deleteJobPost,
    addDocument,
    sendMessage,
    updateProfile
  };
});
