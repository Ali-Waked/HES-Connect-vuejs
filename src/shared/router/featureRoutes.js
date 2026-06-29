/**
 * Route configuration for feature-based modules.
 *
 * These routes follow the feature-based architecture pattern and can be
 * merged into the main router when ready. They demonstrate the proper
 * separation between Super Admin (/platform) and Facility Owner (/dashboard).
 *
 * Usage:
 *   import { platformRoutes, dashboardRoutes } from '@/shared/router/featureRoutes'
 *   // Spread into the children arrays of /platform and /dashboard routes
 */

export const platformRoutes = [
  {
    path: 'facilities',
    name: 'platform-facilities',
    component: () => import('@/platform/facilities/views/FacilitiesListView.vue'),
    meta: { permission: 'view_facilities' },
  },
  {
    path: 'facilities/:id',
    name: 'platform-facilities.detail',
    component: () => import('@/platform/facilities/views/FacilityDetailView.vue'),
    props: true,
    meta: { permission: 'view_facilities' },
  },
]

export const dashboardRoutes = [
  {
    path: 'patients',
    name: 'dashboard-patients',
    component: () => import('@/dashboard/patients/views/PatientsListView.vue'),
    meta: { permission: 'view_patients' },
  },
  {
    path: 'patients/:id',
    name: 'dashboard-patients.detail',
    component: () => import('@/dashboard/patients/views/PatientDetailView.vue'),
    props: true,
    meta: { permission: 'view_patients' },
  },
]
