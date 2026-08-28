import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/LandingPage.vue') },
      { path: 'login', component: () => import('../modules/auth/pages/LoginPage.vue') },
      { path: 'register', component: () => import('../modules/auth/pages/RegisterPage.vue') },
    ],
  },
  {
    path: '/aluno',
    component: () => import('../layouts/StudentLayout.vue'),
    children: [
      { path: '', component: () => import('../modules/courses/pages/EnrollPage.vue') },
      {
        path: 'session/:id',
        component: () => import('../modules/session/pages/StudentSessionPage.vue'),
      },
    ],
  },
  {
    path: '/professor',
    component: () => import('../layouts/ProfessorLayout.vue'),
    children: [
      { path: '', component: () => import('../modules/courses/pages/CourseListPage.vue') },
      {
        path: 'session/:id',
        component: () => import('../modules/session/pages/ProfessorSessionPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue'),
  },
];

export default routes;
