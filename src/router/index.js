import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useWorkspaceStore } from '../stores/workspace';

import HomeView from '../views/front/HomeView.vue';
import LoginView from '../views/front/LoginView.vue';
import RegisterView from '../views/front/RegisterView.vue';
import FacilitiesBrowseView from '../views/front/FacilitiesBrowseView.vue';
import AboutView from '../views/front/AboutView.vue';
import ContactView from '../views/front/ContactView.vue';
import StoriesView from '../views/front/StoriesView.vue';
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
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('../views/errors/UnauthorizedView.vue'),
  },
  {
    path: '/account-pending',
    name: 'account-pending',
    component: () => import('../views/front/AccountPendingView.vue'),
  },
  {
    path: '/select-workspace',
    name: 'select-workspace',
    component: () => import('../views/front/SelectWorkspaceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/facilities',
    name: 'facilities-browse',
    component: FacilitiesBrowseView
  },
  {
    path: '/doctors',
    name: 'public-doctors',
    component: () => import('../views/public/DoctorsView.vue')
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
    path: '/appointments',
    name: 'my-appointments',
    component: () => import('../views/front/AppointmentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/prescriptions',
    name: 'my-prescriptions',
    component: () => import('../views/front/PrescriptionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/prescriptions/:uuid',
    name: 'my-prescription-detail',
    component: () => import('../views/front/PrescriptionDetailView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/medication-requests',
    name: 'my-medication-requests',
    component: () => import('../views/front/MedicationRequestsListPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medication-requests/:uuid',
    name: 'my-medication-request-detail',
    component: () => import('../views/front/MedicationRequestDetailsPage.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-conversations',
    name: 'my-conversations',
    component: () => import('../views/front/MyConversationsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/conversations/:id',
    name: 'conversation-chat',
    component: () => import('../views/front/MyConversationsView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-stories',
    name: 'my-stories',
    component: () => import('../views/front/MyStoriesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/front/FavoritesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscription/verify/:token',
    name: 'subscription-verify',
    component: () => import('../views/front/SubscriptionVerifyView.vue'),
  },
  {
    path: '/subscription/manage/:token',
    name: 'subscription-manage',
    component: () => import('../views/front/SubscriptionManageView.vue'),
  },
  {
    path: '/subscription/unsubscribe/:token',
    name: 'subscription-unsubscribe',
    component: () => import('../views/front/SubscriptionUnsubscribeView.vue'),
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
    path: '/doctors/:uuid',
    name: 'public-doctor-detail',
    component: () => import('../views/public/DoctorDetailsView.vue'),
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
    path: '/jobs',
    name: 'public-jobs',
    component: () => import('../views/front/JobsView.vue')
  },
  {
    path: '/jobs/:slug',
    name: 'public-job-detail',
    component: () => import('../views/front/JobDetailView.vue'),
    props: true
  },
  {
    path: '/my-profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: () => import('../layouts/FacilityLayout.vue'),
    redirect: () => {
      const authStore = useAuthStore()
      if (authStore.can('view_appointments')) return '/dashboard/appointments'
      if (authStore.can('view_patients')) return '/dashboard/patients'
      if (authStore.can('view_staff')) return '/dashboard/staff'
      if (authStore.can('view_prescriptions')) return '/dashboard/prescriptions'
      if (authStore.can('view_departments')) return '/dashboard/departments'
      return '/dashboard'
    },
    meta: { requiresAuth: true, dashboard: 'facility' },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../views/facility/FacilityDashboardView.vue')
      },
      {
        path: 'appointments',
        name: 'dashboard-appointments',
        component: () => import('../views/facility/FacilityAppointmentsView.vue'),
        meta: { permission: 'view_appointments' }
      },
      {
        path: 'patients',
        name: 'dashboard-patients',
        component: () => import('../views/facility/FacilityPatientsView.vue'),
        meta: { permission: 'view_patients' }
      },
      {
        path: 'prescriptions',
        name: 'dashboard-prescriptions',
        component: () => import('../views/facility/FacilityPrescriptionsView.vue'),
        meta: { permission: 'view_prescriptions' }
      },
      {
        path: 'schedule',
        name: 'dashboard-schedule',
        component: () => import('../views/staff/StaffSchedule.vue'),
        meta: { permission: 'view_staff_schedules' }
      },
      {
        path: 'reviews',
        name: 'dashboard-reviews',
        component: () => import('../views/facility/FacilityReviewsView.vue'),
        meta: { permission: 'view_reviews' }
      },
      {
        path: 'inventory',
        name: 'dashboard-inventory',
        component: () => import('../views/staff/PharmacistInventory.vue'),
        meta: { permission: 'view_medicines' }
      },
      {
        path: 'medication-requests',
        name: 'dashboard-medication-requests',
        component: () => import('../views/facility/FacilityMedicationRequestsView.vue'),
        meta: { permission: 'view_medication_requests' }
      },
      {
        path: 'departments',
        name: 'dashboard-departments',
        component: () => import('../views/facility/FacilityDepartmentsView.vue'),
        meta: { permission: 'view_departments' }
      },
      {
        path: 'job-posts',
        name: 'dashboard-job-posts',
        component: () => import('../views/staff/ManagerJobPosts.vue'),
        meta: { permission: 'view_reports' }
      },
      {
        path: 'reports',
        name: 'dashboard-reports',
        component: () => import('../views/staff/ManagerReports.vue'),
        meta: { permission: 'view_reports' }
      },
      {
        path: 'messages',
        name: 'dashboard-messages',
        component: () => import('../views/staff/StaffMessages.vue'),
        meta: { permission: 'view_notifications' }
      },
      {
        path: 'medicines',
        name: 'dashboard-medicines',
        component: () => import('../views/facility/FacilityMedicinesView.vue'),
        meta: { permission: 'view_medicines' }
      },
      {
        path: 'articles',
        name: 'dashboard-articles',
        component: () => import('../views/facility/FacilityArticlesView.vue'),
        meta: { permission: 'view_articles' }
      },
      {
        path: 'articles/:uuid',
        name: 'dashboard-article-detail',
        component: () => import('../views/facility/FacilityArticleDetailView.vue'),
        props: true,
        meta: { permission: 'view_articles' }
      },
      {
        path: 'staff',
        name: 'dashboard-staff',
        component: () => import('../views/facility/FacilityStaffView.vue'),
        meta: { permission: 'view_staff' }
      },
      {
        path: 'analytics',
        name: 'dashboard-analytics',
        component: () => import('../views/facility/FacilityDashboardView.vue'),
        meta: { permission: 'view_dashboard_statistics' }
      },
      {
        path: 'notifications',
        name: 'dashboard-notifications',
        component: () => import('../views/facility/FacilityNotificationsView.vue')
      },
      {
        path: 'profile',
        name: 'dashboard-profile',
        component: () => import('../views/facility/FacilityProfileView.vue')
      }
    ]
  },
  {
    path: '/platform',
    component: () => import('../views/dashboard/DashboardLayout.vue'),
    redirect: '/platform/dashboard',
    meta: { requiresAuth: true, dashboard: 'platform' },
    children: [
      {
        path: 'dashboard',
        name: 'platform-dashboard',
        component: () => import('../views/dashboard/SuperAdminDashboard.vue')
      },
      {
        path: 'appointments',
        name: 'platform-appointments',
        component: () => import('../views/dashboard/AppointmentsView.vue'),
        meta: { permission: 'view_appointments' }
      },
      {
        path: 'prescriptions',
        name: 'platform-prescriptions',
        component: () => import('../views/dashboard/PrescriptionsView.vue'),
        meta: { permission: 'view_prescriptions' }
      },
      {
        path: 'medication-requests',
        name: 'platform-medication-requests',
        component: () => import('../views/dashboard/MedicationRequestsView.vue'),
        meta: { permission: 'view_medication_requests' }
      },
      {
        path: 'medication-request-analytics',
        name: 'platform-medication-request-analytics',
        component: () => import('../views/dashboard/MedicationAnalyticsView.vue'),
        meta: { permission: 'view_dashboard_statistics' }
      },
      {
        path: 'audit-logs',
        name: 'platform-audit-logs',
        component: () => import('../views/dashboard/AuditLogsView.vue'),
        meta: { permission: 'view_activity_logs' }
      },
      {
        path: 'conversations',
        name: 'platform-conversations',
        component: () => import('../views/dashboard/ConversationsView.vue'),
        meta: { permission: 'view_notifications' }
      },
      {
        path: 'organizations',
        name: 'platform-organizations',
        component: () => import('../views/dashboard/OrganizationsView.vue'),
        meta: { permission: 'view_organizations' }
      },
      {
        path: 'organization-users',
        name: 'platform-organization-users',
        component: () => import('../views/dashboard/OrganizationUsersView.vue'),
        meta: { permission: 'view_users' }
      },
      {
        path: 'cities',
        name: 'platform-cities',
        component: () => import('../views/dashboard/cities/index.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'facilities',
        name: 'platform-facilities',
        component: () => import('../views/dashboard/FacilitiesView.vue'),
        meta: { permission: 'view_facilities' }
      },
      {
        path: 'departments',
        name: 'platform-departments',
        component: () => import('../views/dashboard/DepartmentsView.vue'),
        meta: { permission: 'view_departments' }
      },
      {
        path: 'users',
        name: 'platform-users',
        component: () => import('../views/dashboard/UsersView.vue'),
        meta: { permission: 'view_users' }
      },
      {
        path: 'staff',
        name: 'platform-staff',
        component: () => import('../views/dashboard/StaffView.vue'),
        meta: { permission: 'view_staff' }
      },
      {
        path: 'patients',
        name: 'platform-patients',
        component: () => import('../views/dashboard/PatientsView.vue'),
        meta: { permission: 'view_patients' }
      },
      {
        path: 'settings',
        name: 'platform-settings',
        component: () => import('../views/dashboard/SettingsView.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'stories',
        name: 'platform-stories',
        component: () => import('../views/dashboard/StoriesView.vue'),
        meta: { permission: 'view_stories' }
      },
      {
        path: 'stories/:id',
        name: 'platform-story-detail',
        component: () => import('../views/dashboard/StoryDetailView.vue'),
        props: true,
        meta: { permission: 'view_stories' }
      },
      {
        path: 'categories',
        name: 'platform-categories',
        component: () => import('../views/dashboard/CategoriesView.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'articles',
        name: 'platform-articles',
        component: () => import('../views/dashboard/ArticlesView.vue'),
        meta: { permission: 'view_articles' }
      },
      {
        path: 'articles/:id',
        name: 'platform-article-detail',
        component: () => import('../views/dashboard/ArticleDetailView.vue'),
        props: true,
        meta: { permission: 'view_articles' }
      },
      {
        path: 'jobs',
        name: 'platform-jobs',
        component: () => import('../views/dashboard/JobsView.vue'),
        meta: { permission: 'view_reports' }
      },
      {
        path: 'jobs/:id',
        name: 'platform-job-detail',
        component: () => import('../views/dashboard/JobDetailView.vue'),
        props: true,
        meta: { permission: 'view_reports' }
      },
      {
        path: 'roles',
        name: 'platform-roles',
        component: () => import('../views/dashboard/RolesView.vue'),
        meta: { permission: 'view_roles' }
      },
      {
        path: 'permissions',
        name: 'platform-permissions',
        component: () => import('../views/dashboard/PermissionsView.vue'),
        meta: { permission: 'view_permissions' }
      },
      {
        path: 'tags',
        name: 'platform-tags',
        component: () => import('../views/dashboard/TagsView.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'facilities/:id',
        name: 'platform-facility-detail',
        component: () => import('../views/dashboard/FacilityDetailView.vue'),
        props: true,
        meta: { permission: 'view_facilities' }
      },
      {
        path: 'staff/:uuid',
        name: 'platform-staff-detail',
        component: () => import('../views/dashboard/StaffDetailView.vue'),
        props: true,
        meta: { permission: 'view_staff' }
      },
      {
        path: 'messages',
        name: 'platform-messages',
        component: () => import('../views/dashboard/MessagesView.vue'),
        meta: { permission: 'view_notifications' }
      },
      {
        path: 'reviews',
        name: 'platform-reviews',
        component: () => import('../views/dashboard/ReviewsView.vue'),
        meta: { permission: 'view_reviews' }
      },
      {
        path: 'reports',
        name: 'platform-reports',
        component: () => import('../views/dashboard/ReportsView.vue'),
        meta: { permission: 'view_reports' }
      },
      {
        path: 'invoices',
        name: 'platform-invoices',
        component: () => import('../views/dashboard/InvoicesView.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'payments',
        name: 'platform-payments',
        component: () => import('../views/dashboard/PaymentsView.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'donations',
        name: 'platform-donations',
        component: () => import('../views/dashboard/DonationsView.vue'),
        meta: { permission: 'view_reports' }
      },
      {
        path: 'medicines',
        meta: { permission: 'view_medicines' },
        children: [
          { path: '', name: 'platform-medicines', component: () => import('../views/dashboard/MedicinesView.vue') },
          { path: 'create', name: 'platform-medicines.create', component: () => import('../views/dashboard/MedicinesCreateView.vue') },
          { path: ':uuid', name: 'platform-medicines.show', component: () => import('../views/dashboard/MedicinesShowView.vue'), props: true },
          { path: ':uuid/edit', name: 'platform-medicines.edit', component: () => import('../views/dashboard/MedicinesEditView.vue'), props: true },
        ]
      },
      {
        path: 'symptoms',
        name: 'platform-symptoms',
        component: () => import('../views/dashboard/SymptomsView.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'search',
        name: 'platform-search-history',
        component: () => import('../views/dashboard/SearchHistoryView.vue'),
        meta: { permission: 'view_settings' }
      },
      {
        path: 'notifications',
        name: 'platform-notifications',
        component: () => import('../views/dashboard/NotificationsView.vue'),
        meta: { permission: 'view_notifications' }
      },
      {
        path: 'positions',
        name: 'platform-positions',
        component: () => import('../views/dashboard/positions/index.vue'),
        meta: { permission: 'view_staff_schedules' }
      },
      {
        path: 'positions/:uuid',
        name: 'platform-positions.show',
        component: () => import('../views/dashboard/positions/_uuid/index.vue'),
        props: true,
        meta: { permission: 'view_staff_schedules' }
      }
    ]
  },
  {
    path: '/organization',
    component: () => import('../views/organization/OrganizationLayout.vue'),
    redirect: '/organization/dashboard',
    meta: { requiresAuth: true, dashboard: 'organization' },
    children: [
      { path: 'dashboard', name: 'organization-dashboard', component: () => import('../views/organization/OrganizationDashboard.vue') }
    ]
  },
  {
    path: '/facility/:pathMatch(.*)*',
    redirect: to => `/dashboard/${to.params.pathMatch ? to.params.pathMatch.join('/') : ''}`,
    meta: { requiresAuth: true }
  },
  {
    path: '/facility',
    redirect: '/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/facility-owner/:pathMatch(.*)*',
    redirect: to => `/dashboard/${to.params.pathMatch ? to.params.pathMatch.join('/') : ''}`,
    meta: { requiresAuth: true }
  },
  {
    path: '/facility-owner',
    redirect: '/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/errors/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

function hasPermission(permissions) {
  const authStore = useAuthStore()
  if (typeof permissions === 'string') return authStore.can(permissions)
  if (Array.isArray(permissions)) return authStore.canAll(permissions)
  return true
}

function canAccessDashboard(dashboard, authStore) {
  switch (dashboard) {
    case 'platform':
      return authStore.systemPermissions.length > 0
    case 'facility':
      return authStore.staffMemberships.length > 0
    case 'organization':
      return authStore.staffMemberships.length > 0
    default:
      return true
  }
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.initCalled) {
    await authStore.init();
  }

  const routeMeta = to.meta
  const isAuthenticated = authStore.authenticated

  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (routeMeta.requiresGuest && isAuthenticated) {
    return authStore.dashboardRoute || '/';
  }

  if (isAuthenticated && authStore.staffMemberships.length > 0 && !authStore.activeWorkspace && to.name !== 'select-workspace') {
    return { name: 'select-workspace' }
  }

  const routeDashboard = routeMeta.dashboard
  if (routeDashboard && isAuthenticated && !canAccessDashboard(routeDashboard, authStore)) {
    return { name: 'unauthorized' }
  }

  if (routeMeta.permission || routeMeta.permissions) {
    const required = routeMeta.permissions || [routeMeta.permission]
    if (!hasPermission(required)) {
      return { name: 'unauthorized' }
    }
  }
});

export default router;
