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
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: () => import('../layouts/FacilityLayout.vue'),
    redirect: () => {
      const ws = useWorkspaceStore()
      return ws.resolveDashboardLanding()
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
        meta: { permission: 'appointments.view' }
      },
      {
        path: 'patients',
        name: 'dashboard-patients',
        component: () => import('../views/facility/FacilityPatientsView.vue'),
        meta: { permission: 'patients.view' }
      },
      {
        path: 'prescriptions',
        name: 'dashboard-prescriptions',
        component: () => import('../views/facility/FacilityPrescriptionsView.vue'),
        meta: { permission: 'prescriptions.view' }
      },
      {
        path: 'schedule',
        name: 'dashboard-schedule',
        component: () => import('../views/staff/StaffSchedule.vue'),
        meta: { permission: 'schedule.view' }
      },
      {
        path: 'reviews',
        name: 'dashboard-reviews',
        component: () => import('../views/facility/FacilityReviewsView.vue'),
        meta: { permission: 'reviews.view' }
      },
      {
        path: 'inventory',
        name: 'dashboard-inventory',
        component: () => import('../views/staff/PharmacistInventory.vue'),
        meta: { permission: 'inventory.view' }
      },
      {
        path: 'medication-requests',
        name: 'dashboard-medication-requests',
        component: () => import('../views/facility/FacilityMedicationRequestsView.vue'),
        meta: { permission: 'medication_requests.view' }
      },
      {
        path: 'departments',
        name: 'dashboard-departments',
        component: () => import('../views/facility/FacilityDepartmentsView.vue'),
        meta: { permission: 'departments.view' }
      },
      {
        path: 'job-posts',
        name: 'dashboard-job-posts',
        component: () => import('../views/staff/ManagerJobPosts.vue'),
        meta: { permission: 'job_posts.view' }
      },
      {
        path: 'documents',
        name: 'dashboard-documents',
        component: () => import('../views/staff/ManagerDocuments.vue'),
        meta: { permission: 'documents.view' }
      },
      {
        path: 'reports',
        name: 'dashboard-reports',
        component: () => import('../views/staff/ManagerReports.vue'),
        meta: { permission: 'reports.view' }
      },
      {
        path: 'messages',
        name: 'dashboard-messages',
        component: () => import('../views/staff/StaffMessages.vue'),
        meta: { permission: 'messages.view' }
      },
      {
        path: 'medicines',
        name: 'dashboard-medicines',
        component: () => import('../views/facility/FacilityMedicinesView.vue'),
        meta: { permission: 'medicines.view' }
      },
      {
        path: 'articles',
        name: 'dashboard-articles',
        component: () => import('../views/facility/FacilityArticlesView.vue'),
        meta: { permission: 'articles.view' }
      },
      {
        path: 'staff',
        name: 'dashboard-staff',
        component: () => import('../views/facility/FacilityStaffView.vue'),
        meta: { permission: 'staff.view' }
      },
      {
        path: 'analytics',
        name: 'dashboard-analytics',
        component: () => import('../views/facility/FacilityDashboardView.vue'),
        meta: { permission: 'facility.analytics.view' }
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
        meta: { permission: 'appointments.view' }
      },
      {
        path: 'prescriptions',
        name: 'platform-prescriptions',
        component: () => import('../views/dashboard/PrescriptionsView.vue'),
        meta: { permission: 'prescriptions.view' }
      },
      {
        path: 'medication-requests',
        name: 'platform-medication-requests',
        component: () => import('../views/dashboard/MedicationRequestsView.vue'),
        meta: { permission: 'medication_requests.view' }
      },
      {
        path: 'medication-request-analytics',
        name: 'platform-medication-request-analytics',
        component: () => import('../views/dashboard/MedicationAnalyticsView.vue'),
        meta: { permission: 'analytics.view' }
      },
      {
        path: 'audit-logs',
        name: 'platform-audit-logs',
        component: () => import('../views/dashboard/AuditLogsView.vue'),
        meta: { permission: 'activity_logs.view' }
      },
      {
        path: 'conversations',
        name: 'platform-conversations',
        component: () => import('../views/dashboard/ConversationsView.vue'),
        meta: { permission: 'messages.view' }
      },
      {
        path: 'organizations',
        name: 'platform-organizations',
        component: () => import('../views/dashboard/OrganizationsView.vue'),
        meta: { permission: 'organizations.view' }
      },
      {
        path: 'organization-users',
        name: 'platform-organization-users',
        component: () => import('../views/dashboard/OrganizationUsersView.vue'),
        meta: { permission: 'organization_users.view' }
      },
      {
        path: 'cities',
        name: 'platform-cities',
        component: () => import('../views/dashboard/cities/index.vue'),
        meta: { permission: 'cities.view' }
      },
      {
        path: 'facilities',
        name: 'platform-facilities',
        component: () => import('../views/dashboard/FacilitiesView.vue'),
        meta: { permission: 'facilities.view' }
      },
      {
        path: 'departments',
        name: 'platform-departments',
        component: () => import('../views/dashboard/DepartmentsView.vue'),
        meta: { permission: 'departments.view' }
      },
      {
        path: 'users',
        name: 'platform-users',
        component: () => import('../views/dashboard/UsersView.vue'),
        meta: { permission: 'users.view' }
      },
      {
        path: 'staff',
        name: 'platform-staff',
        component: () => import('../views/dashboard/StaffView.vue'),
        meta: { permission: 'staff.view' }
      },
      {
        path: 'patients',
        name: 'platform-patients',
        component: () => import('../views/dashboard/PatientsView.vue'),
        meta: { permission: 'patients.view' }
      },
      {
        path: 'settings',
        name: 'platform-settings',
        component: () => import('../views/dashboard/SettingsView.vue'),
        meta: { permission: 'settings.view' }
      },
      {
        path: 'stories',
        name: 'platform-stories',
        component: () => import('../views/dashboard/StoriesView.vue'),
        meta: { permission: 'stories.view' }
      },
      {
        path: 'stories/:id',
        name: 'platform-story-detail',
        component: () => import('../views/dashboard/StoryDetailView.vue'),
        props: true,
        meta: { permission: 'stories.view' }
      },
      {
        path: 'categories',
        name: 'platform-categories',
        component: () => import('../views/dashboard/CategoriesView.vue'),
        meta: { permission: 'categories.view' }
      },
      {
        path: 'articles',
        name: 'platform-articles',
        component: () => import('../views/dashboard/ArticlesView.vue'),
        meta: { permission: 'articles.view' }
      },
      {
        path: 'articles/:id',
        name: 'platform-article-detail',
        component: () => import('../views/dashboard/ArticleDetailView.vue'),
        props: true,
        meta: { permission: 'articles.view' }
      },
      {
        path: 'jobs',
        name: 'platform-jobs',
        component: () => import('../views/dashboard/JobsView.vue'),
        meta: { permission: 'jobs.view' }
      },
      {
        path: 'jobs/:id',
        name: 'platform-job-detail',
        component: () => import('../views/dashboard/JobDetailView.vue'),
        props: true,
        meta: { permission: 'jobs.view' }
      },
      {
        path: 'roles',
        name: 'platform-roles',
        component: () => import('../views/dashboard/RolesView.vue'),
        meta: { permission: 'roles.view' }
      },
      {
        path: 'permissions',
        name: 'platform-permissions',
        component: () => import('../views/dashboard/PermissionsView.vue'),
        meta: { permission: 'permissions.view' }
      },
      {
        path: 'tags',
        name: 'platform-tags',
        component: () => import('../views/dashboard/TagsView.vue'),
        meta: { permission: 'tags.view' }
      },
      {
        path: 'facilities/:id',
        name: 'platform-facility-detail',
        component: () => import('../views/dashboard/FacilityDetailView.vue'),
        props: true,
        meta: { permission: 'facilities.view' }
      },
      {
        path: 'staff/:uuid',
        name: 'platform-staff-detail',
        component: () => import('../views/dashboard/StaffDetailView.vue'),
        props: true,
        meta: { permission: 'staff.view' }
      },
      {
        path: 'messages',
        name: 'platform-messages',
        component: () => import('../views/dashboard/MessagesView.vue'),
        meta: { permission: 'messages.view' }
      },
      {
        path: 'reviews',
        name: 'platform-reviews',
        component: () => import('../views/dashboard/ReviewsView.vue'),
        meta: { permission: 'reviews.view' }
      },
      {
        path: 'reports',
        name: 'platform-reports',
        component: () => import('../views/dashboard/ReportsView.vue'),
        meta: { permission: 'reports.view' }
      },
      {
        path: 'invoices',
        name: 'platform-invoices',
        component: () => import('../views/dashboard/InvoicesView.vue'),
        meta: { permission: 'invoices.view' }
      },
      {
        path: 'payments',
        name: 'platform-payments',
        component: () => import('../views/dashboard/PaymentsView.vue'),
        meta: { permission: 'payments.view' }
      },
      {
        path: 'medicines',
        meta: { permission: 'medicines.view' },
        children: [
          { path: '', name: 'platform-medicines', component: () => import('../views/dashboard/MedicinesView.vue') },
          { path: 'create', name: 'platform-medicines.create', component: () => import('../views/dashboard/MedicinesCreateView.vue') },
          { path: ':uuid', name: 'platform-medicines.show', component: () => import('../views/dashboard/MedicinesShowView.vue'), props: true },
          { path: ':uuid/edit', name: 'platform-medicines.edit', component: () => import('../views/dashboard/MedicinesEditView.vue'), props: true },
        ]
      },
      {
        path: 'positions',
        name: 'platform-positions',
        component: () => import('../views/dashboard/positions/index.vue'),
        meta: { permission: 'positions.view' }
      },
      {
        path: 'positions/:uuid',
        name: 'platform-positions.show',
        component: () => import('../views/dashboard/positions/_uuid/index.vue'),
        props: true,
        meta: { permission: 'positions.view' }
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
    path: '/facility',
    redirect: '/dashboard',
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

function canAccessDashboard(dashboard, authStore, workspaceStore) {
  switch (dashboard) {
    case 'platform':
      return authStore.isSuperAdmin() || authStore.isAdmin() || authStore.isModerator()
    case 'facility':
      return !!workspaceStore.currentWorkspace || authStore.staffMemberships.length > 0
    case 'organization':
      return authStore.hasAnyRole('organization_admin', 'organization_owner')
    default:
      return true
  }
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const workspaceStore = useWorkspaceStore();

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

  const routeDashboard = routeMeta.dashboard
  if (routeDashboard && isAuthenticated && !canAccessDashboard(routeDashboard, authStore, workspaceStore)) {
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
