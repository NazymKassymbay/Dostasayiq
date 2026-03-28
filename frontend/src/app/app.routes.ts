import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'posts', loadComponent: () => import('./pages/post-list/post-list.component').then(m => m.PostListComponent) },
  { path: 'posts/:id', loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
  { path: 'create', loadComponent: () => import('./pages/create-post/create-post.component').then(m => m.CreatePostComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'profile/:username', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'messages', loadComponent: () => import('./pages/messages/messages.component').then(m => m.MessagesComponent), canActivate: [authGuard] },
  { path: 'messages/:username', loadComponent: () => import('./pages/messages/messages.component').then(m => m.MessagesComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'posts' },
];
