import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Static imports for core user-facing landing views
import HomeView from '../views/front/HomeView.vue';
import LoginView from '../views/front/LoginView.vue';
import RegisterView from '../views/front/RegisterView.vue';
import FacilitiesBrowseView from '../views/front/FacilitiesBrowseView.vue';
import AboutView from '../views/front/AboutView.vue';
import ContactView from '../views/front/ContactView.vue';
import DoctorBrowseView from '../views/front/DoctorBrowseView.vue';
import StoriesView from '../views/front/StoriesView.vue';
import DashboardLayout from '../views/dashboard/DashboardLayout.vue';
import ProfileView from '../views/ProfileView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/front/ForgotPasswordView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/front/ResetPasswordView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('../views/front/EmailVerificationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/email/verify',
    name: 'verify-email-success',
    component: () => import('../views/front/VerifyEmailSuccessView.vue'),
  },
  {
    path: '/password-reset-success',
    name: 'password-reset-success',
    component: () => import('../views/front/PasswordResetSuccessView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/access-denied',
    name: 'access-denied',
    component: () => import('../views/front/AccessDeniedView.vue'),
  },
  {
    path: '/account-pending',
    name: 'account-pending',
    component: () => import('../views/front/AccountPendingView.vue'),
  },
  {
    path: '/facilities',
    name: 'facilities-browse',
    component: FacilitiesBrowseView
  },
  {
    path: '/doctors',
    name: 'public-doctors',
    component: DoctorBrowseView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/front/AboutView.vue')
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/front/ContactView.vue')
  },
  {
    path: '/stories',
    name: 'public-stories',
    component: () => import('../views/front/StoriesView.vue')
  },
  {
    path: '/facilities/:id',
    name: 'public-facility-detail',
    component: () => import('../views/front/FacilityDetailView.vue'),
    props: true
  },
  {
    path: '/doctors/:id',
    name: 'public-doctor-detail',
    component: () => import('../views/front/DoctorDetailView.vue'),
    props: true
  },
  {
    path: '/articles',
    name: 'public-articles',
    component: () => import('../views/front/ArticlesView.vue')
  },
  {
    path: '/articles/:id',
    name: 'public-article-detail',
    component: () => import('../views/front/ArticleDetailView.vue'),
    props: true
  },
  {
    path: '/stories/:id',
    name: 'story-detail',
    component: () => import('../views/StoryDetail.vue'),
    props: true
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/dashboard/SuperAdminDashboard.vue')
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: () => import('../views/dashboard/AppointmentsView.vue')
      },
      {
        path: 'prescriptions',
        name: 'prescriptions',
        component: () => import('../views/dashboard/PrescriptionsView.vue')
      },
      {
        path: 'medication-requests',
        name: 'medication-requests',
        component: () => import('../views/dashboard/MedicationRequestsView.vue')
      },
      {
        path: 'audit-logs',
        name: 'audit-logs',
        component: () => import('../views/dashboard/AuditLogsView.vue')
      },
      {
        path: 'conversations',
        name: 'conversations',
        component: () => import('../views/dashboard/ConversationsView.vue')
      },
      {
        path: 'organizations',
        name: 'organizations',
        component: () => import('../views/dashboard/OrganizationsView.vue')
      },
      {
        path: 'organization-users',
        name: 'organization-users',
        component: () => import('../views/dashboard/OrganizationUsersView.vue')
      },
      {
        path: 'cities',
        name: 'cities',
        component: () => import('../views/dashboard/cities/index.vue')
      },
      {
        path: 'cities/create',
        name: 'cities.create',
        component: () => import('../views/dashboard/cities/create.vue')
      },
      {
        path: 'cities/:uuid/edit',
        name: 'cities.edit',
        component: () => import('../views/dashboard/cities/_uuid/edit.vue'),
        props: true
      },
      {
        path: 'facilities',
        name: 'facilities',
        component: () => import('../views/dashboard/FacilitiesView.vue')
      },
      {
        path: 'departments',
        name: 'departments',
        component: () => import('../views/dashboard/DepartmentsView.vue')
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('../views/dashboard/UsersView.vue')
      },
      {
        path: 'staff',
        name: 'staff',
        component: () => import('../views/dashboard/StaffView.vue')
      },
      {
        path: 'patients',
        name: 'patients',
        component: () => import('../views/dashboard/PatientsView.vue')
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/dashboard/SettingsView.vue')
      },
      {
        path: 'stories',
        name: 'admin-stories',
        component: () => import('../views/dashboard/StoriesView.vue')
      },
      {
        path: 'stories/:id',
        name: 'story-detail',
        component: () => import('../views/dashboard/StoryDetailView.vue'),
        props: true
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('../views/dashboard/CategoriesView.vue')
      },
      {
        path: 'articles',
        name: 'articles',
        component: () => import('../views/dashboard/ArticlesView.vue')
      },
      {
        path: 'articles/:id',
        name: 'article-detail',
        component: () => import('../views/dashboard/ArticleDetailView.vue'),
        props: true
      },
      {
        path: 'jobs',
        name: 'jobs',
        component: () => import('../views/dashboard/JobsView.vue')
      },
      {
        path: 'jobs/:id',
        name: 'job-detail',
        component: () => import('../views/dashboard/JobDetailView.vue'),
        props: true
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('../views/dashboard/RolesView.vue')
      },
      {
        path: 'permissions',
        name: 'permissions',
        component: () => import('../views/dashboard/PermissionsView.vue')
      },
      {
        path: 'tags',
        name: 'tags',
        component: () => import('../views/dashboard/TagsView.vue')
      },
      {
        path: 'facilities/:id',
        name: 'facility-detail',
        component: () => import('../views/dashboard/FacilityDetailView.vue'),
        props: true
      },
      {
        path: 'staff/:uuid',
        name: 'staff-detail',
        component: () => import('../views/dashboard/StaffDetailView.vue'),
        props: true
      },
      {
        path: 'messages',
        name: 'messages',
        component: () => import('../views/dashboard/MessagesView.vue')
      },
      {
        path: 'reviews',
        name: 'reviews',
        component: () => import('../views/dashboard/ReviewsView.vue')
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/dashboard/ReportsView.vue')
      },
      {
        path: 'invoices',
        name: 'invoices',
        component: () => import('../views/dashboard/InvoicesView.vue')
      },
      {
        path: 'payments',
        name: 'payments',
        component: () => import('../views/dashboard/PaymentsView.vue')
      },
      {
        path: 'medicines',
        name: 'medicines',
        component: () => import('../views/dashboard/MedicinesView.vue')
      },
      {
        path: 'positions',
        name: 'positions',
        component: () => import('../views/dashboard/positions/index.vue')
      },
      {
        path: 'positions/:uuid',
        name: 'positions.show',
        component: () => import('../views/dashboard/positions/_uuid/index.vue'),
        props: true
      }
    ]
  },
  {
    path: '/staff',
    component: () => import('../views/staff/StaffLayout.vue'),
    redirect: '/staff/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'staff-dashboard', component: () => import('../views/staff/StaffDashboard.vue') },
      { path: 'appointments', name: 'staff-appointments', component: () => import('../views/staff/StaffAppointments.vue') },
      { path: 'patients', name: 'staff-patients', component: () => import('../views/staff/StaffPatients.vue') },
      { path: 'prescriptions', name: 'staff-prescriptions', component: () => import('../views/staff/StaffPrescriptions.vue') },
      { path: 'schedule', name: 'staff-schedule', component: () => import('../views/staff/StaffSchedule.vue') },
      { path: 'reviews', name: 'staff-reviews', component: () => import('../views/staff/StaffReviews.vue') },
      { path: 'inventory', name: 'pharmacist-inventory', component: () => import('../views/staff/PharmacistInventory.vue') },
      { path: 'medication-requests', name: 'medication-requests-staff', component: () => import('../views/staff/MedicationRequests.vue') },
      { path: 'departments', name: 'manager-departments', component: () => import('../views/staff/ManagerDepartments.vue') },
      { path: 'job-posts', name: 'manager-job-posts', component: () => import('../views/staff/ManagerJobPosts.vue') },
      { path: 'documents', name: 'manager-documents', component: () => import('../views/staff/ManagerDocuments.vue') },
      { path: 'reports', name: 'manager-reports', component: () => import('../views/staff/ManagerReports.vue') },
      { path: 'messages', name: 'staff-messages', component: () => import('../views/staff/StaffMessages.vue') },
      { path: 'profile', name: 'staff-profile', component: () => import('../views/staff/StaffProfile.vue') }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Ensure auth state is loaded before checking guards
  if (!authStore.initCalled) {
    await authStore.init();
  }

  // Route requires authentication, but user is anonymous
  if (to.matched.some((record) => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Route is for guests only, but user is signed in
  if ((to.meta.requiresGuest || to.meta.guestOnly) && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }
});

export default router;
