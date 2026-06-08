import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const today = new Date().toISOString().slice(0, 10);
const dayMs = 86400000;
const dateFromNow = (days) => new Date(Date.now() + days * dayMs).toISOString().slice(0, 10);
const nextId = (items) => (items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1);

const names = [
  'Mariam Al-Haddad', 'Khaled Abu Amr', 'Layla Nasser', 'Yousef Barakat', 'Rania Saleh',
  'Omar Al-Khalil', 'Noor Mansour', 'Hassan Al-Masri', 'Alaa Shurrab', 'Samar Abu Nada',
  'Tariq Al-Najjar', 'Dina Al-Qedra', 'Mahmoud Hijazi', 'Hiba Al-Sayed', 'Anas Zaqout',
  'Reem Ashour', 'Ibrahim Abu Taha', 'Salma Al-Banna', 'Fadi Al-Ghoul', 'Nour Al-Din'
];

export const useStaffStore = defineStore('staff', () => {
  const currentUser = ref({
    id: 1,
    name: 'Dr. Ahmed Al-Masri',
    email: 'ahmed@health.ps',
    role: 'doctor',
    specialization: 'Cardiology',
    experience: 8,
    fee: 50,
    facilityId: 1,
    avatar: null,
    phone: '+970 59 222 4411',
    gender: 'male',
    birthDate: '1986-04-12',
    address: 'Al-Rimal, Gaza City',
    bio: 'Cardiologist focused on practical care for chronic heart conditions.'
  });

  const appointments = ref(Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    patientName: names[index],
    patientAvatar: null,
    doctorName: index % 3 === 0 ? 'Dr. Ahmed Al-Masri' : index % 3 === 1 ? 'Dr. Hala Abu Rayan' : 'Dr. Samer Al-Khatib',
    date: index < 6 ? today : dateFromNow((index % 10) - 3),
    time: `${String(8 + (index % 9)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`,
    facilityName: index % 2 ? 'Al-Shifa Medical Complex' : 'European Gaza Hospital',
    status: ['booked', 'completed', 'cancelled', 'rescheduled'][index % 4],
    notes: index % 2 ? 'Follow-up consultation and vital signs review.' : 'Initial assessment with patient history.'
  })));

  const patients = ref(Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    name: names[index],
    email: `${names[index].toLowerCase().replaceAll(' ', '.')}@mail.ps`,
    phone: `+970 59 ${String(1000000 + index * 37391).slice(0, 7)}`,
    gender: index % 2 ? 'female' : 'male',
    birthDate: `${1978 + (index % 24)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    medicalHistory: ['Hypertension', 'Diabetes type 2', 'Asthma', 'No chronic illness'][index % 4],
    lastVisit: dateFromNow(-index - 1),
    totalAppointments: 2 + (index % 8)
  })));

  const prescriptions = ref(Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    patientName: names[index],
    appointmentDate: dateFromNow(-index),
    medicines: [
      { name: ['Paracetamol', 'Amoxicillin', 'Aspirin'][index % 3], dosage: '1 tablet twice daily', duration: '5 days' },
      { name: ['Omeprazole', 'Salbutamol', 'Vitamin D'][index % 3], dosage: '1 dose daily', duration: '10 days' }
    ]
  })));

  const schedule = ref([
    { id: 1, dayOfWeek: 0, dayName: 'Sunday', startTime: '09:00', endTime: '13:00', slotDuration: 30 },
    { id: 2, dayOfWeek: 1, dayName: 'Monday', startTime: '10:00', endTime: '14:00', slotDuration: 30 },
    { id: 3, dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '12:00', slotDuration: 20 },
    { id: 4, dayOfWeek: 3, dayName: 'Wednesday', startTime: '11:00', endTime: '15:00', slotDuration: 30 },
    { id: 5, dayOfWeek: 4, dayName: 'Thursday', startTime: '08:30', endTime: '12:30', slotDuration: 30 }
  ]);

  const unavailableDates = ref([
    { id: 1, date: dateFromNow(2), reason: 'Hospital committee meeting' },
    { id: 2, date: dateFromNow(5), reason: 'Training workshop' },
    { id: 3, date: dateFromNow(9), reason: 'Conference duty' },
    { id: 4, date: dateFromNow(14), reason: 'Personal leave' },
    { id: 5, date: dateFromNow(19), reason: 'Facility audit' }
  ]);

  const reviews = ref(Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    patientName: names[index],
    rating: [5, 4, 5, 4, 3, 5][index % 6],
    comment: ['Clear explanation and kind follow-up.', 'Professional and punctual.', 'Helpful care plan.', 'Good consultation experience.'][index % 4],
    date: dateFromNow(-index - 1),
    appointmentDate: dateFromNow(-index - 4)
  })));

  const articles = ref(Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    title: ['Heart Health During Stress', 'Managing Diabetes Safely', 'Asthma Action Plans', 'Medication Safety', 'Nutrition for Recovery', 'Emergency Warning Signs'][index],
    category: ['Cardiology', 'Diabetes', 'Pulmonology', 'Pharmacy', 'Nutrition', 'Emergency'][index],
    status: ['published', 'draft', 'pending_review'][index % 3],
    views: 220 + index * 137,
    tags: ['health', 'gaza'],
    date: dateFromNow(-index * 3),
    author: currentUser.value.name
  })));

  const inventory = ref(Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    medicineName: ['Paracetamol', 'Amoxicillin', 'Aspirin', 'Insulin', 'Salbutamol', 'Omeprazole', 'Cetirizine', 'Metformin', 'Atorvastatin', 'Cefixime'][index % 10] + ` ${index + 1}`,
    description: 'Essential medicine used across facility pharmacy workflows.',
    quantity: [4, 8, 12, 18, 25, 31, 7, 14, 22, 40][index % 10],
    price: Number((2.5 + index * 0.75).toFixed(2))
  })));

  const medicationRequests = ref(Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    patientName: names[index],
    prescriptionId: index + 1,
    medicines: [
      { name: 'Paracetamol 1', dosage: '500mg twice daily', duration: '5 days' },
      { name: 'Amoxicillin 2', dosage: '250mg three times daily', duration: '7 days' }
    ],
    status: ['pending', 'approved', 'rejected', 'pending'][index % 4],
    date: dateFromNow(-index)
  })));

  const departments = ref([
    { id: 1, name: 'Cardiology', headDoctor: 'Dr. Ahmed Al-Masri', staffCount: 8 },
    { id: 2, name: 'Emergency', headDoctor: 'Dr. Samer Al-Khatib', staffCount: 14 },
    { id: 3, name: 'Pediatrics', headDoctor: 'Dr. Hala Abu Rayan', staffCount: 9 },
    { id: 4, name: 'Pharmacy', headDoctor: 'Ph. Rami Al-Najjar', staffCount: 6 },
    { id: 5, name: 'Internal Medicine', headDoctor: 'Dr. Mona Shurrab', staffCount: 11 }
  ]);

  const facilityStaff = ref(Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: ['Dr. Ahmed Al-Masri', 'Dr. Hala Abu Rayan', 'Dr. Samer Al-Khatib', 'Nurse Lina Barakat', 'Nurse Omar Hijazi', 'Ph. Rami Al-Najjar'][index % 6],
    specialization: ['Cardiology', 'Pediatrics', 'Emergency', 'Nursing', 'Nursing', 'Pharmacy'][index % 6],
    department: departments.value[index % departments.value.length].name,
    position: ['Consultant', 'Specialist', 'Head Nurse', 'Nurse', 'Pharmacist'][index % 5],
    experience: 2 + (index % 12),
    email: `staff${index + 1}@health.ps`
  })));

  const jobPosts = ref(Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    title: ['Emergency Nurse', 'Pharmacy Assistant', 'Lab Technician', 'Pediatric Doctor', 'Reception Officer', 'Data Clerk'][index],
    description: 'Healthcare facility vacancy for an experienced professional.',
    applyMethod: index % 2 ? 'link' : 'email',
    applyValue: index % 2 ? 'https://health.ps/jobs/apply' : 'jobs@health.ps',
    endDate: dateFromNow(4 + index * 5),
    status: index % 2 ? 'approved' : 'pending',
    category: ['Clinical', 'Pharmacy', 'Laboratory', 'Clinical', 'Admin', 'Admin'][index]
  })));

  const documents = ref(Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    documentType: ['License Renewal', 'Facility Certificate', 'Staff Credential', 'Safety Report'][index % 4],
    status: ['pending', 'approved', 'rejected'][index % 3],
    fileUrl: `document-${index + 1}.pdf`,
    uploadDate: dateFromNow(-index * 2)
  })));

  const conversations = ref(Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    participantName: names[index + 5],
    participantRole: ['Patient', 'Nurse', 'Manager', 'Pharmacist', 'Doctor'][index],
    lastMessage: ['Can you confirm the appointment?', 'The report is ready.', 'Please review this request.', 'Medicine stock updated.', 'Thank you doctor.'][index],
    lastTime: `${9 + index}:1${index}`,
    unreadCount: index % 3,
    messages: [
      { id: 1, senderId: 99, text: 'Hello, I need help with my appointment.', time: '09:00', isMe: false },
      { id: 2, senderId: currentUser.value.id, text: 'I can help. Please share the details.', time: '09:05', isMe: true }
    ]
  })));

  const announcements = ref([
    { id: 1, title: 'Clinic hours updated', content: 'Morning clinic starts at 8:30 AM this week.', isActive: true, date: today },
    { id: 2, title: 'Medication audit', content: 'Pharmacy inventory audit scheduled for Thursday.', isActive: true, date: dateFromNow(1) },
    { id: 3, title: 'Training session', content: 'Patient safety training available for all staff.', isActive: false, date: dateFromNow(3) }
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
    prescriptions.value.unshift({ id: nextId(prescriptions.value), ...prescription });
  }

  function addScheduleSlot(slot) {
    schedule.value.push({ id: nextId(schedule.value), dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek], ...slot });
  }

  function deleteScheduleSlot(id) {
    schedule.value = schedule.value.filter((item) => item.id !== id);
  }

  function addUnavailableDate(entry) {
    unavailableDates.value.unshift({ id: nextId(unavailableDates.value), ...entry });
  }

  function deleteUnavailableDate(id) {
    unavailableDates.value = unavailableDates.value.filter((item) => item.id !== id);
  }

  function addInventoryItem(item) {
    inventory.value.unshift({ id: nextId(inventory.value), ...item });
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
      const stock = inventory.value.find((item) => item.medicineName === medicine.name);
      if (stock) stock.quantity = Math.max(0, stock.quantity - 1);
    });
  }

  function rejectRequest(id) {
    const request = medicationRequests.value.find((item) => item.id === id);
    if (request) request.status = 'rejected';
  }

  function addDepartment(dept) {
    departments.value.unshift({ id: nextId(departments.value), staffCount: 0, ...dept });
  }

  function updateDepartment(id, data) {
    const item = departments.value.find((dept) => dept.id === id);
    if (item) Object.assign(item, data);
  }

  function deleteDepartment(id) {
    departments.value = departments.value.filter((item) => item.id !== id);
  }

  function addJobPost(post) {
    jobPosts.value.unshift({ id: nextId(jobPosts.value), status: 'pending', ...post });
  }

  function updateJobPost(id, data) {
    const item = jobPosts.value.find((post) => post.id === id);
    if (item) Object.assign(item, data);
  }

  function deleteJobPost(id) {
    jobPosts.value = jobPosts.value.filter((item) => item.id !== id);
  }

  function addDocument(document) {
    documents.value.unshift({ id: nextId(documents.value), status: 'pending', uploadDate: today, ...document });
  }

  function sendMessage(conversationId, text) {
    const conversation = conversations.value.find((item) => item.id === conversationId);
    if (!conversation || !text.trim()) return;
    conversation.messages.push({ id: nextId(conversation.messages), senderId: currentUser.value.id, text: text.trim(), time: new Date().toTimeString().slice(0, 5), isMe: true });
    conversation.lastMessage = text.trim();
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
