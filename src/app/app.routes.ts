import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

/** Rutas de BeautyLab. Todas se cargan bajo demanda (lazy) para que la app inicie rápido. */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'BeautyLab · Aprende y comparte maquillaje',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'acceder',
    title: 'Acceder · BeautyLab',
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'explorar',
    title: 'Explorar tutoriales · BeautyLab',
    loadComponent: () => import('./features/tutorials/explore').then((m) => m.Explore),
  },
  {
    path: 'categorias',
    title: 'Categorías · BeautyLab',
    loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'productos',
    title: 'Productos recomendados · BeautyLab',
    loadComponent: () => import('./features/products/products').then((m) => m.Products),
  },
  {
    path: 'tutoriales/nuevo',
    canActivate: [authGuard],
    title: 'Nuevo tutorial · BeautyLab',
    loadComponent: () => import('./features/tutorials/tutorial-form').then((m) => m.TutorialForm),
  },
  {
    path: 'tutoriales/:id/editar',
    canActivate: [authGuard],
    title: 'Editar tutorial · BeautyLab',
    loadComponent: () => import('./features/tutorials/tutorial-form').then((m) => m.TutorialForm),
  },
  {
    path: 'tutoriales/:id',
    title: 'Tutorial · BeautyLab',
    loadComponent: () => import('./features/tutorials/tutorial-detail').then((m) => m.TutorialDetailPage),
  },
  {
    path: 'mi-aprendizaje',
    canActivate: [authGuard],
    title: 'Mi aprendizaje · BeautyLab',
    loadComponent: () => import('./features/me/my-learning').then((m) => m.MyLearning),
  },
  {
    path: 'mi-kit',
    canActivate: [authGuard],
    title: 'Mi kit · BeautyLab',
    loadComponent: () => import('./features/me/my-kit').then((m) => m.MyKit),
  },
  {
    path: 'notificaciones',
    canActivate: [authGuard],
    title: 'Notificaciones · BeautyLab',
    loadComponent: () => import('./features/me/notifications').then((m) => m.Notifications),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    title: 'Mi perfil · BeautyLab',
    loadComponent: () => import('./features/me/profile').then((m) => m.Profile),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    title: 'Administración · BeautyLab',
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  { path: '**', redirectTo: '' },
];
