import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/LandingPage.vue') },
      { path: 'login', component: () => import('@/modules/auth/pages/LoginPage.vue') },
      { path: 'register', component: () => import('@/modules/auth/pages/RegisterPage.vue') },
      { path: 'termos', component: () => import('@/pages/TermsPage.vue') },
      { path: 'privacidade', component: () => import('@/pages/PrivacyPage.vue') },
      {
        path: 'privacidade-seguranca',
        component: () => import('@/pages/PrivacidadeSegurancaPage.vue'),
      },
    ],
  },
  {
    path: '/hub',
    component: () => import('@/layouts/StudentLayout.vue'),
    children: [{ path: '', component: () => import('@/modules/courses/pages/EnrollPage.vue') }],
  },
  {
    path: '/disciplinas',
    component: () => import('@/layouts/ProfessorLayout.vue'),
    children: [
      { path: '', component: () => import('@/modules/courses/pages/CourseListPage.vue') },
      {
        path: ':cursoId/insights',
        component: () => import('@/modules/dashboard/pages/CourseInsightsPage.vue'),
      },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/ProfessorLayout.vue'),
    children: [
      { path: '', component: () => import('@/modules/dashboard/pages/GlobalDashboardPage.vue') },
    ],
  },
  {
    path: '/sala',
    component: () => import('@/layouts/SessionLayout.vue'),
    children: [
      {
        path: ':id',
        component: () => import('@/modules/session/pages/SessionGatewayPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
