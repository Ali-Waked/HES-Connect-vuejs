import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeView from '../views/front/HomeView.vue';
import LoginView from '../views/front/LoginView.vue';
import RegisterView from '../views/front/RegisterView.vue';
import DashboardLayout from '../views/dashboard/DashboardLayout.vue';
import DashboardView from '../views/dashboard/DashboardView.vue';
import OrganizationsView from '../views/dashboard/OrganizationsView.vue';
import FacilitiesView from '../views/dashboard/FacilitiesView.vue';
import DepartmentsView from '../views/dashboard/DepartmentsView.vue';
import UsersView from '../views/dashboard/UsersView.vue';
import StoriesView from '../views/dashboard/StoriesView.vue';
import StoryDetailView from '../views/dashboard/StoryDetailView.vue';
import ArticlesView from '../views/dashboard/ArticlesView.vue';
import ArticleDetailView from '../views/dashboard/ArticleDetailView.vue';
import JobsView from '../views/dashboard/JobsView.vue';
import JobDetailView from '../views/dashboard/JobDetailView.vue';
import StaffView from '../views/dashboard/StaffView.vue';
import PatientsView from '../views/dashboard/PatientsView.vue';
import SettingsView from '../views/dashboard/SettingsView.vue';

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
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView
      },
      {
        path: 'organizations',
        name: 'organizations',
        component: OrganizationsView
      },
      {
        path: 'facilities',
        name: 'facilities',
        component: FacilitiesView
      },
      {
        path: 'departments',
        name: 'departments',
        component: DepartmentsView
      },
      {
        path: 'users',
        name: 'users',
        component: UsersView
      },
      {
        path: 'staff',
        name: 'staff',
        component: StaffView
      },
      {
        path: 'patients',
        name: 'patients',
        component: PatientsView
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView
      },
      {
        path: 'stories',
        name: 'stories',
        component: StoriesView
      },
      {
        path: 'stories/:id',
        name: 'story-detail',
        component: StoryDetailView
      },
      {
        path: 'articles',
        name: 'articles',
        component: ArticlesView
      },
      {
        path: 'articles/:id',
        name: 'article-detail',
        component: ArticleDetailView
      },
      {
        path: 'jobs',
        name: 'jobs',
        component: JobsView
      },
      {
        path: 'jobs/:id',
        name: 'job-detail',
        component: JobDetailView
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

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.matched.some((record) => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }
});

export default router;
