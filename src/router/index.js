import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Static imports for core user-facing landing views
import HomeView from '../views/front/HomeView.vue';
import LoginView from '../views/front/LoginView.vue';
import RegisterView from '../views/front/RegisterView.vue';
import FacilitiesBrowseView from '../views/front/FacilitiesBrowseView.vue';
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
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/facilities',
    name: 'facilities-browse',
    component: FacilitiesBrowseView
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
        path: 'comments',
        name: 'comments',
        component: () => import('../views/dashboard/CommentsView.vue')
      },
      {
        path: 'organizations',
        name: 'organizations',
        component: () => import('../views/dashboard/OrganizationsView.vue')
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
        name: 'stories',
        component: () => import('../views/dashboard/StoriesView.vue')
      },
      {
        path: 'stories/:id',
        name: 'story-detail',
        component: () => import('../views/dashboard/StoryDetailView.vue'),
        props: true // Automatically passes the :id parameter as a prop to the component
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
      // Restoring previously missing route definitions for your imported views:
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
        path: 'staff/:id',
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
      }
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
router.beforeEach((to) => {
  const authStore = useAuthStore();

  // Route requires authentication, but user is anonymous
  if (to.matched.some((record) => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Route is for guests only, but user is signed in
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }
});

export default router;
